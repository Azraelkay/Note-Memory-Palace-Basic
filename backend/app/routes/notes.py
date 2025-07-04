from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Note, Tag, Category, User, NoteVersion
from app import db
from sqlalchemy import or_, and_, func, desc
from datetime import datetime, timedelta
import os
import uuid
from werkzeug.utils import secure_filename

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/', methods=['GET'])
@jwt_required()
def get_notes():
    """获取当前用户的所有笔记，支持搜索和过滤"""
    current_user_id = int(get_jwt_identity())

    # 获取查询参数
    search = request.args.get('search', '').strip()
    tags = request.args.get('tags', '').strip()
    categories = request.args.get('categories', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # 构建基础查询 - 只返回未删除的笔记
    query = Note.get_active_notes(current_user_id)

    # 添加搜索条件
    if search:
        search_filter = or_(
            Note.title.contains(search),
            Note.content.contains(search)
        )
        query = query.filter(search_filter)

    # 添加标签过滤
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        if tag_list:
            query = query.join(Note.tags).filter(Tag.name.in_(tag_list))

    # 添加分类过滤
    if categories:
        category_list = [cat.strip() for cat in categories.split(',') if cat.strip()]
        if category_list:
            query = query.join(Note.categories).filter(Category.name.in_(category_list))

    # 排序和分页
    query = query.order_by(Note.updated_at.desc())

    if per_page > 0:
        notes = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        notes_data = notes.items
        total = notes.total
        has_next = notes.has_next
        has_prev = notes.has_prev
    else:
        notes_data = query.all()
        total = len(notes_data)
        has_next = False
        has_prev = False

    # 格式化返回数据
    result = [{
        'id': note.id,
        'title': note.title,
        'content': note.content,
        'created_at': note.created_at.isoformat(),
        'updated_at': note.updated_at.isoformat(),
        'tags': [tag.name for tag in note.tags],
        'categories': [category.name for category in note.categories]
    } for note in notes_data]

    return jsonify({
        'notes': result,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'has_next': has_next,
            'has_prev': has_prev
        }
    }), 200

@notes_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_note(id):
    """获取单个笔记"""
    current_user_id = int(get_jwt_identity())
    
    # 查询笔记（只查询未删除的）
    note = Note.query.filter_by(id=id, user_id=current_user_id, is_deleted=False).first_or_404()
    
    # 格式化返回数据
    result = {
        'id': note.id,
        'title': note.title,
        'content': note.content,
        'created_at': note.created_at.isoformat(),
        'updated_at': note.updated_at.isoformat(),
        'tags': [tag.name for tag in note.tags],
        'categories': [category.name for category in note.categories]
    }
    
    return jsonify(result), 200

@notes_bp.route('', methods=['POST'])
@notes_bp.route('/', methods=['POST'])
@jwt_required()
def create_note():
    """创建新笔记"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # 验证数据
    if not data or not data.get('title'):
        return jsonify({'error': '标题不能为空'}), 400
    
    # 创建笔记
    note = Note(
        title=data['title'],
        content=data.get('content', ''),
        user_id=current_user_id
    )
    
    # 处理标签
    if 'tags' in data and isinstance(data['tags'], list):
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            note.tags.append(tag)
    
    # 处理分类
    if 'categories' in data and isinstance(data['categories'], list):
        for category_name in data['categories']:
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                category = Category(name=category_name)
                db.session.add(category)
            note.categories.append(category)
    
    db.session.add(note)
    db.session.commit()

    # 为新创建的笔记创建初始版本
    note.create_version("初始版本")
    db.session.commit()

    # 返回创建的笔记
    return jsonify({
        'id': note.id,
        'title': note.title,
        'content': note.content,
        'created_at': note.created_at.isoformat(),
        'updated_at': note.updated_at.isoformat(),
        'tags': [tag.name for tag in note.tags],
        'categories': [category.name for category in note.categories]
    }), 201

@notes_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_note(id):
    """更新笔记"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # 验证数据
    if not data:
        return jsonify({'error': '没有提供数据'}), 400
    
    # 查询笔记（只查询未删除的）
    note = Note.query.filter_by(id=id, user_id=current_user_id, is_deleted=False).first_or_404()

    # 检查是否有实际内容变更
    has_content_change = False
    change_summary_parts = []

    if 'title' in data and data['title'] != note.title:
        has_content_change = True
        change_summary_parts.append('标题')

    if 'content' in data and data['content'] != note.content:
        has_content_change = True
        change_summary_parts.append('内容')

    if 'tags' in data:
        current_tag_names = set(tag.name for tag in note.tags)
        new_tag_names = set(data['tags'])
        if current_tag_names != new_tag_names:
            has_content_change = True
            change_summary_parts.append('标签')

    if 'categories' in data:
        current_category_names = set(category.name for category in note.categories)
        new_category_names = set(data['categories'])
        if current_category_names != new_category_names:
            has_content_change = True
            change_summary_parts.append('分类')

    # 如果有内容变更，先创建版本快照
    if has_content_change:
        change_summary = f"更新了{', '.join(change_summary_parts)}"
        note.create_version(change_summary)

    # 更新笔记
    if 'title' in data:
        note.title = data['title']

    if 'content' in data:
        note.content = data['content']
    
    # 更新标签
    if 'tags' in data and isinstance(data['tags'], list):
        # 清除现有标签
        note.tags = []
        
        # 添加新标签
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            note.tags.append(tag)
    
    # 更新分类
    if 'categories' in data and isinstance(data['categories'], list):
        # 清除现有分类
        note.categories = []
        
        # 添加新分类
        for category_name in data['categories']:
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                category = Category(name=category_name)
                db.session.add(category)
            note.categories.append(category)
    
    db.session.commit()
    
    # 返回更新后的笔记
    return jsonify({
        'id': note.id,
        'title': note.title,
        'content': note.content,
        'created_at': note.created_at.isoformat(),
        'updated_at': note.updated_at.isoformat(),
        'tags': [tag.name for tag in note.tags],
        'categories': [category.name for category in note.categories]
    }), 200

@notes_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_note(id):
    """软删除笔记（移到回收站）"""
    current_user_id = int(get_jwt_identity())

    # 查询笔记（只查询未删除的）
    note = Note.query.filter_by(id=id, user_id=current_user_id, is_deleted=False).first_or_404()

    # 软删除笔记
    note.soft_delete()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': '笔记已移到回收站'
    }), 200

@notes_bp.route('/search', methods=['GET'])
@jwt_required()
def search_notes():
    """高级搜索笔记"""
    current_user_id = int(get_jwt_identity())

    # 获取查询参数
    q = request.args.get('q', '').strip()
    tags = request.args.get('tags', '').strip()
    categories = request.args.get('categories', '').strip()
    date_from = request.args.get('date_from', '').strip()
    date_to = request.args.get('date_to', '').strip()

    if not q and not tags and not categories:
        return jsonify({'error': '请提供搜索条件'}), 400

    # 构建查询（只查询未删除的笔记）
    query = Note.get_active_notes(current_user_id)

    # 全文搜索
    if q:
        search_terms = q.split()
        search_conditions = []
        for term in search_terms:
            search_conditions.append(
                or_(
                    Note.title.contains(term),
                    Note.content.contains(term)
                )
            )
        if search_conditions:
            query = query.filter(and_(*search_conditions))

    # 标签过滤
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        if tag_list:
            query = query.join(Note.tags).filter(Tag.name.in_(tag_list))

    # 分类过滤
    if categories:
        category_list = [cat.strip() for cat in categories.split(',') if cat.strip()]
        if category_list:
            query = query.join(Note.categories).filter(Category.name.in_(category_list))

    # 日期过滤
    if date_from:
        try:
            from datetime import datetime
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            query = query.filter(Note.created_at >= date_from_obj)
        except ValueError:
            pass

    if date_to:
        try:
            from datetime import datetime
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            query = query.filter(Note.created_at <= date_to_obj)
        except ValueError:
            pass

    # 执行查询
    notes = query.order_by(Note.updated_at.desc()).all()

    # 格式化返回数据
    result = [{
        'id': note.id,
        'title': note.title,
        'content': note.content,
        'created_at': note.created_at.isoformat(),
        'updated_at': note.updated_at.isoformat(),
        'tags': [tag.name for tag in note.tags],
        'categories': [category.name for category in note.categories]
    } for note in notes]

    return jsonify({
        'notes': result,
        'total': len(result),
        'query': {
            'search': q,
            'tags': tags,
            'categories': categories,
            'date_from': date_from,
            'date_to': date_to
        }
    }), 200

@notes_bp.route('/tags', methods=['GET'])
@jwt_required()
def get_tags():
    """获取当前用户的所有标签"""
    current_user_id = int(get_jwt_identity())

    # 查询用户的所有标签（通过笔记关联）
    tags = db.session.query(Tag).join(Note.tags).filter(
        Note.user_id == current_user_id
    ).distinct().all()

    result = [{
        'id': tag.id,
        'name': tag.name,
        'count': tag.notes.filter_by(user_id=current_user_id).count()
    } for tag in tags]

    return jsonify(result), 200

@notes_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """获取当前用户的所有分类（层级结构）"""
    current_user_id = int(get_jwt_identity())

    # 获取查询参数
    include_tree = request.args.get('tree', 'false').lower() == 'true'

    if include_tree:
        # 返回层级结构
        root_categories = Category.query.filter_by(
            user_id=current_user_id,
            parent_id=None
        ).order_by(Category.name).all()

        result = [category.to_dict(include_children=True) for category in root_categories]
    else:
        # 返回扁平列表（用于搜索过滤）
        categories = Category.query.filter_by(user_id=current_user_id).order_by(Category.name).all()
        result = [category.to_dict() for category in categories]

    return jsonify(result), 200

@notes_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    """创建新分类"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    # 验证数据
    if not data or not data.get('name'):
        return jsonify({'error': '分类名称不能为空'}), 400

    name = data['name'].strip()
    parent_id = data.get('parent_id')

    # 检查同级分类名称是否重复
    existing = Category.query.filter_by(
        name=name,
        parent_id=parent_id,
        user_id=current_user_id
    ).first()

    if existing:
        return jsonify({'error': '同级分类中已存在相同名称'}), 400

    # 如果有父分类，验证父分类是否存在且属于当前用户
    if parent_id:
        parent = Category.query.filter_by(id=parent_id, user_id=current_user_id).first()
        if not parent:
            return jsonify({'error': '父分类不存在'}), 400

    # 创建分类
    category = Category(
        name=name,
        description=data.get('description', ''),
        color=data.get('color', '#3B82F6'),
        icon=data.get('icon', ''),
        parent_id=parent_id,
        user_id=current_user_id
    )

    db.session.add(category)
    db.session.commit()

    return jsonify(category.to_dict()), 201

@notes_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """更新分类"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    # 查找分类
    category = Category.query.filter_by(id=category_id, user_id=current_user_id).first_or_404()

    # 更新字段
    if 'name' in data:
        name = data['name'].strip()
        if name:
            # 检查同级分类名称是否重复
            existing = Category.query.filter_by(
                name=name,
                parent_id=category.parent_id,
                user_id=current_user_id
            ).filter(Category.id != category_id).first()

            if existing:
                return jsonify({'error': '同级分类中已存在相同名称'}), 400

            category.name = name

    if 'description' in data:
        category.description = data['description']

    if 'color' in data:
        category.color = data['color']

    if 'icon' in data:
        category.icon = data['icon']

    if 'parent_id' in data:
        new_parent_id = data['parent_id']

        # 防止循环引用
        if new_parent_id:
            # 检查新父分类是否是当前分类的子分类
            new_parent = Category.query.filter_by(id=new_parent_id, user_id=current_user_id).first()
            if not new_parent:
                return jsonify({'error': '父分类不存在'}), 400

            # 检查是否会造成循环引用
            current_check = new_parent
            while current_check:
                if current_check.id == category.id:
                    return jsonify({'error': '不能将分类移动到其子分类下'}), 400
                current_check = current_check.parent

        category.parent_id = new_parent_id

    db.session.commit()

    return jsonify(category.to_dict()), 200

@notes_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """删除分类"""
    current_user_id = int(get_jwt_identity())

    # 查找分类
    category = Category.query.filter_by(id=category_id, user_id=current_user_id).first_or_404()

    # 检查是否有子分类
    if category.children.count() > 0:
        return jsonify({'error': '请先删除所有子分类'}), 400

    # 检查是否有关联的笔记
    notes_count = category.notes.filter_by(user_id=current_user_id).count()
    if notes_count > 0:
        return jsonify({'error': f'该分类下还有 {notes_count} 篇笔记，请先移除关联'}), 400

    db.session.delete(category)
    db.session.commit()

    return jsonify({'success': True}), 200

# 文件上传相关配置
ALLOWED_EXTENSIONS = {
    'images': {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'},
    'documents': {'pdf', 'doc', 'docx', 'txt', 'md', 'rtf'},
    'archives': {'zip', 'rar', '7z', 'tar', 'gz'},
    'others': {'json', 'xml', 'csv', 'xlsx', 'pptx'}
}

def allowed_file(filename, file_type='all'):
    """检查文件类型是否允许"""
    if '.' not in filename:
        return False

    ext = filename.rsplit('.', 1)[1].lower()

    if file_type == 'all':
        all_extensions = set()
        for extensions in ALLOWED_EXTENSIONS.values():
            all_extensions.update(extensions)
        return ext in all_extensions
    elif file_type in ALLOWED_EXTENSIONS:
        return ext in ALLOWED_EXTENSIONS[file_type]

    return False

def get_file_type(filename):
    """获取文件类型分类"""
    if '.' not in filename:
        return 'others'

    ext = filename.rsplit('.', 1)[1].lower()

    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return file_type

    return 'others'

@notes_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """上传文件"""
    current_user_id = int(get_jwt_identity())

    # 检查是否有文件
    if 'file' not in request.files:
        return jsonify({'error': '没有选择文件'}), 400

    file = request.files['file']

    # 检查文件名
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400

    # 检查文件类型
    if not allowed_file(file.filename):
        return jsonify({'error': '不支持的文件类型'}), 400

    # 检查文件大小 (10MB限制)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > 10 * 1024 * 1024:  # 10MB
        return jsonify({'error': '文件大小不能超过10MB'}), 400

    try:
        # 生成安全的文件名
        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        unique_filename = f"{uuid.uuid4().hex}.{file_ext}" if file_ext else uuid.uuid4().hex

        # 创建上传目录
        upload_dir = os.path.join(current_app.root_path, '..', 'uploads', str(current_user_id))
        os.makedirs(upload_dir, exist_ok=True)

        # 保存文件
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)

        # 返回文件信息
        file_info = {
            'id': uuid.uuid4().hex,
            'original_name': original_filename,
            'filename': unique_filename,
            'file_type': get_file_type(original_filename),
            'file_size': file_size,
            'upload_time': datetime.utcnow().isoformat(),
            'url': f'/api/notes/files/{current_user_id}/{unique_filename}'
        }

        return jsonify(file_info), 201

    except Exception as e:
        return jsonify({'error': f'文件上传失败: {str(e)}'}), 500

@notes_bp.route('/files/<int:user_id>/<filename>')
@jwt_required()
def get_file(user_id, filename):
    """获取上传的文件"""
    current_user_id = int(get_jwt_identity())

    # 只允许用户访问自己的文件
    if current_user_id != user_id:
        return jsonify({'error': '无权访问此文件'}), 403

    try:
        upload_dir = os.path.join(current_app.root_path, '..', 'uploads', str(user_id))
        return send_from_directory(upload_dir, filename)
    except FileNotFoundError:
        return jsonify({'error': '文件不存在'}), 404

# ==================== 版本历史相关API ====================

@notes_bp.route('/<int:note_id>/versions', methods=['GET'])
@jwt_required()
def get_note_versions(note_id):
    """获取笔记的版本历史列表"""
    current_user_id = int(get_jwt_identity())

    # 验证笔记所有权（允许访问已删除笔记的版本历史）
    note = Note.query.filter_by(id=note_id, user_id=current_user_id).first_or_404()

    # 获取版本列表
    versions = note.versions.all()

    result = [version.to_dict() for version in versions]

    return jsonify({
        'note_id': note_id,
        'note_title': note.title,
        'versions': result,
        'total_versions': len(result)
    }), 200

@notes_bp.route('/<int:note_id>/versions/<int:version_number>', methods=['GET'])
@jwt_required()
def get_note_version(note_id, version_number):
    """获取笔记的特定版本"""
    current_user_id = int(get_jwt_identity())

    # 验证笔记所有权（允许访问已删除笔记的版本）
    note = Note.query.filter_by(id=note_id, user_id=current_user_id).first_or_404()

    # 获取指定版本
    version = note.get_version_by_number(version_number)
    if not version:
        return jsonify({'error': '版本不存在'}), 404

    return jsonify(version.to_dict()), 200

@notes_bp.route('/<int:note_id>/versions/<int:version_number>/restore', methods=['POST'])
@jwt_required()
def restore_note_version(note_id, version_number):
    """恢复笔记到指定版本"""
    current_user_id = int(get_jwt_identity())

    # 验证笔记所有权（只允许恢复未删除的笔记版本）
    note = Note.query.filter_by(id=note_id, user_id=current_user_id, is_deleted=False).first_or_404()

    # 恢复到指定版本
    success = note.restore_from_version(version_number)
    if not success:
        return jsonify({'error': '版本不存在或恢复失败'}), 400

    try:
        db.session.commit()

        # 返回恢复后的笔记信息
        result = {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'created_at': note.created_at.isoformat(),
            'updated_at': note.updated_at.isoformat(),
            'tags': [tag.name for tag in note.tags],
            'categories': [category.name for category in note.categories],
            'restored_from_version': version_number
        }

        return jsonify({
            'message': f'成功恢复到版本 {version_number}',
            'note': result
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'恢复失败: {str(e)}'}), 500

@notes_bp.route('/<int:note_id>/versions/create', methods=['POST'])
@jwt_required()
def create_note_version(note_id):
    """手动创建笔记版本快照"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    # 验证笔记所有权（只允许为未删除的笔记创建版本）
    note = Note.query.filter_by(id=note_id, user_id=current_user_id, is_deleted=False).first_or_404()

    # 获取变更摘要
    change_summary = data.get('change_summary', '手动创建版本')

    try:
        # 创建版本快照
        version = note.create_version(change_summary)
        db.session.commit()

        return jsonify({
            'message': '版本创建成功',
            'version': version.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'版本创建失败: {str(e)}'}), 500

# ==================== 回收站相关API ====================

@notes_bp.route('/trash', methods=['GET'])
@jwt_required()
def get_trash_notes():
    """获取回收站中的笔记列表"""
    current_user_id = int(get_jwt_identity())

    # 获取查询参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # 查询已删除的笔记
    query = Note.get_deleted_notes(current_user_id)

    # 按删除时间倒序排列
    query = query.order_by(Note.deleted_at.desc())

    # 分页
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    notes = pagination.items

    # 格式化返回数据
    result = []
    for note in notes:
        result.append({
            'id': note.id,
            'title': note.title,
            'content': note.content[:200] + '...' if len(note.content) > 200 else note.content,
            'created_at': note.created_at.isoformat(),
            'updated_at': note.updated_at.isoformat(),
            'deleted_at': note.deleted_at.isoformat() if note.deleted_at else None,
            'tags': [tag.name for tag in note.tags],
            'categories': [category.name for category in note.categories]
        })

    return jsonify({
        'notes': result,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    }), 200

@notes_bp.route('/trash/<int:id>/restore', methods=['POST'])
@jwt_required()
def restore_note(id):
    """从回收站恢复笔记"""
    current_user_id = int(get_jwt_identity())

    # 查询已删除的笔记
    note = Note.query.filter_by(id=id, user_id=current_user_id, is_deleted=True).first_or_404()

    # 恢复笔记
    note.restore()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': '笔记已恢复',
        'note': {
            'id': note.id,
            'title': note.title,
            'updated_at': note.updated_at.isoformat()
        }
    }), 200

@notes_bp.route('/trash/<int:id>', methods=['DELETE'])
@jwt_required()
def permanently_delete_note(id):
    """永久删除笔记"""
    current_user_id = int(get_jwt_identity())

    # 查询已删除的笔记
    note = Note.query.filter_by(id=id, user_id=current_user_id, is_deleted=True).first_or_404()

    # 先删除相关的版本记录
    from app.models.note import NoteVersion
    NoteVersion.query.filter_by(note_id=note.id).delete()

    # 永久删除笔记
    db.session.delete(note)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': '笔记已永久删除'
    }), 200

@notes_bp.route('/trash/empty', methods=['DELETE'])
@jwt_required()
def empty_trash():
    """清空回收站"""
    current_user_id = int(get_jwt_identity())

    # 查询所有已删除的笔记
    deleted_notes = Note.get_deleted_notes(current_user_id).all()

    # 先删除所有相关的版本记录
    from app.models.note import NoteVersion
    for note in deleted_notes:
        NoteVersion.query.filter_by(note_id=note.id).delete()

    # 永久删除所有笔记
    for note in deleted_notes:
        db.session.delete(note)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'已清空回收站，永久删除了 {len(deleted_notes)} 篇笔记'
    }), 200

# ==================== 数据统计相关API ====================

@notes_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_notes_stats():
    """获取笔记统计数据"""
    current_user_id = int(get_jwt_identity())

    try:
        # 获取查询参数
        days = request.args.get('days', 30, type=int)  # 默认30天

        # 计算日期范围
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days-1)

        # 基础统计
        total_notes = Note.query.filter_by(user_id=current_user_id, is_deleted=False).count()
        total_categories = Category.query.filter_by(user_id=current_user_id).count()
        total_tags = db.session.query(Tag).join(Note.tags).filter(Note.user_id == current_user_id).distinct().count()

        # 最近创建的笔记数量
        recent_notes = Note.query.filter(
            and_(
                Note.user_id == current_user_id,
                Note.is_deleted == False,
                func.date(Note.created_at) >= start_date,
                func.date(Note.created_at) <= end_date
            )
        ).count()

        # 最近更新的笔记数量
        recent_updates = Note.query.filter(
            and_(
                Note.user_id == current_user_id,
                Note.is_deleted == False,
                func.date(Note.updated_at) >= start_date,
                func.date(Note.updated_at) <= end_date,
                Note.updated_at != Note.created_at  # 排除创建时的更新
            )
        ).count()

        # 按日期统计每天的笔记创建数量
        daily_creation_stats = db.session.query(
            func.date(Note.created_at).label('date'),
            func.count(Note.id).label('count')
        ).filter(
            and_(
                Note.user_id == current_user_id,
                Note.is_deleted == False,
                func.date(Note.created_at) >= start_date,
                func.date(Note.created_at) <= end_date
            )
        ).group_by(func.date(Note.created_at)).all()

        # 转换为字典格式
        daily_creation = {}
        for stat in daily_creation_stats:
            date_str = stat.date.isoformat() if hasattr(stat.date, 'isoformat') else str(stat.date)
            daily_creation[date_str] = stat.count

        # 按分类统计笔记数量
        category_stats = db.session.query(
            Category.name.label('category'),
            func.count(Note.id).label('count')
        ).join(Note.categories).filter(
            and_(
                Note.user_id == current_user_id,
                Note.is_deleted == False
            )
        ).group_by(Category.name).order_by(desc('count')).limit(10).all()

        category_distribution = [
            {'name': stat.category, 'count': stat.count}
            for stat in category_stats
        ]

        # 按标签统计笔记数量
        tag_stats = db.session.query(
            Tag.name.label('tag'),
            func.count(Note.id).label('count')
        ).join(Note.tags).filter(
            and_(
                Note.user_id == current_user_id,
                Note.is_deleted == False
            )
        ).group_by(Tag.name).order_by(desc('count')).limit(10).all()

        tag_distribution = [
            {'name': stat.tag, 'count': stat.count}
            for stat in tag_stats
        ]

        # 字数统计
        notes_with_content = Note.query.filter(
            and_(
                Note.user_id == current_user_id,
                Note.is_deleted == False,
                Note.content.isnot(None)
            )
        ).all()

        total_words = sum(len(note.content.split()) for note in notes_with_content if note.content)
        avg_words_per_note = total_words / len(notes_with_content) if notes_with_content else 0

        return jsonify({
            'period': {
                'days': days,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'overview': {
                'total_notes': total_notes,
                'total_categories': total_categories,
                'total_tags': total_tags,
                'recent_notes': recent_notes,
                'recent_updates': recent_updates,
                'total_words': total_words,
                'avg_words_per_note': round(avg_words_per_note, 1)
            },
            'daily_creation': daily_creation,
            'category_distribution': category_distribution,
            'tag_distribution': tag_distribution
        }), 200

    except Exception as e:
        return jsonify({'error': f'获取统计数据失败: {str(e)}'}), 500