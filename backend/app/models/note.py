from app import db
from datetime import datetime
import json
import json

# 笔记-标签关联表
note_tags = db.Table('note_tags',
    db.Column('note_id', db.Integer, db.ForeignKey('notes.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

# 笔记-分类关联表
note_categories = db.Table('note_categories',
    db.Column('note_id', db.Integer, db.ForeignKey('notes.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('categories.id'), primary_key=True)
)

class Note(db.Model):
    """笔记模型"""
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # 软删除字段
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # 定义关系
    tags = db.relationship('Tag', secondary=note_tags, lazy='dynamic',
                          backref=db.backref('notes', lazy='dynamic'))
    categories = db.relationship('Category', secondary=note_categories, lazy='dynamic',
                                backref=db.backref('notes', lazy='dynamic'))
    
    def create_version(self, change_summary=None):
        """创建当前笔记的版本快照"""
        version = NoteVersion.create_from_note(self, change_summary)
        db.session.add(version)
        return version

    def get_latest_version(self):
        """获取最新版本"""
        return self.versions.first()

    def get_version_by_number(self, version_number):
        """根据版本号获取版本"""
        return self.versions.filter_by(version_number=version_number).first()

    def restore_from_version(self, version_number):
        """从指定版本恢复笔记内容"""
        version = self.get_version_by_number(version_number)
        if not version:
            return False

        # 在恢复前创建当前版本的快照
        self.create_version(f"恢复到版本 {version_number}")

        # 恢复内容
        self.title = version.title
        self.content = version.content

        # 恢复标签
        self.tags = []
        if version.tags_snapshot:
            tag_names = json.loads(version.tags_snapshot)
            for tag_name in tag_names:
                tag = Tag.query.filter_by(name=tag_name).first()
                if tag:
                    self.tags.append(tag)

        # 恢复分类
        self.categories = []
        if version.categories_snapshot:
            category_names = json.loads(version.categories_snapshot)
            for category_name in category_names:
                category = Category.query.filter_by(name=category_name, user_id=self.user_id).first()
                if category:
                    self.categories.append(category)

        return True

    def get_version_count(self):
        """获取版本总数"""
        return self.versions.count()

    def soft_delete(self):
        """软删除笔记"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def restore(self):
        """恢复已删除的笔记"""
        self.is_deleted = False
        self.deleted_at = None
        self.updated_at = datetime.utcnow()

    def is_in_trash(self):
        """检查笔记是否在回收站中"""
        return self.is_deleted

    @classmethod
    def get_active_notes(cls, user_id):
        """获取用户的活跃笔记（未删除）"""
        return cls.query.filter_by(user_id=user_id, is_deleted=False)

    @classmethod
    def get_deleted_notes(cls, user_id):
        """获取用户的已删除笔记（回收站）"""
        return cls.query.filter_by(user_id=user_id, is_deleted=True)

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user_id': self.user_id,
            'is_deleted': self.is_deleted,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
            'tags': [tag.name for tag in self.tags],
            'categories': [cat.name for cat in self.categories]
        }

    def __repr__(self):
        return f'<Note {self.title}>'

class Tag(db.Model):
    """标签模型"""
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<Tag {self.name}>'

class Category(db.Model):
    """分类模型 - 支持层级结构"""
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#3B82F6')  # 十六进制颜色代码
    icon = db.Column(db.String(50))  # 图标名称
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 自引用关系 - 支持层级结构
    children = db.relationship('Category',
                              backref=db.backref('parent', remote_side=[id]),
                              lazy='dynamic')

    # 添加唯一约束：同一用户下的同级分类名称不能重复
    __table_args__ = (
        db.UniqueConstraint('name', 'parent_id', 'user_id', name='unique_category_per_parent_user'),
    )

    def to_dict(self, include_children=False):
        """转换为字典格式"""
        result = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'parent_id': self.parent_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'notes_count': self.notes.filter_by(user_id=self.user_id).count()
        }

        if include_children:
            result['children'] = [child.to_dict(include_children=True)
                                for child in self.children.all()]

        return result

    def get_path(self):
        """获取分类的完整路径"""
        path = [self.name]
        current = self.parent
        while current:
            path.insert(0, current.name)
            current = current.parent
        return ' > '.join(path)

    def get_all_descendants(self):
        """获取所有子分类（递归）"""
        descendants = []
        for child in self.children:
            descendants.append(child)
            descendants.extend(child.get_all_descendants())
        return descendants

    def __repr__(self):
        return f'<Category {self.name}>'

class NoteVersion(db.Model):
    """笔记版本历史模型"""
    __tablename__ = 'note_versions'

    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id', ondelete='CASCADE'), nullable=False)
    version_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    tags_snapshot = db.Column(db.Text)  # JSON格式存储标签快照
    categories_snapshot = db.Column(db.Text)  # JSON格式存储分类快照
    change_summary = db.Column(db.String(500))  # 变更摘要
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    # 定义关系
    note = db.relationship('Note', backref=db.backref('versions', lazy='dynamic', order_by='NoteVersion.version_number.desc()'))
    creator = db.relationship('User', backref='note_versions')

    # 添加唯一约束：同一笔记的版本号不能重复
    __table_args__ = (
        db.UniqueConstraint('note_id', 'version_number', name='unique_note_version'),
    )

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'note_id': self.note_id,
            'version_number': self.version_number,
            'title': self.title,
            'content': self.content,
            'tags': json.loads(self.tags_snapshot) if self.tags_snapshot else [],
            'categories': json.loads(self.categories_snapshot) if self.categories_snapshot else [],
            'change_summary': self.change_summary,
            'created_at': self.created_at.isoformat(),
            'created_by': self.created_by
        }

    @staticmethod
    def create_from_note(note, change_summary=None):
        """从当前笔记创建版本快照"""
        # 获取当前笔记的最大版本号
        latest_version = NoteVersion.query.filter_by(note_id=note.id).order_by(NoteVersion.version_number.desc()).first()
        next_version = (latest_version.version_number + 1) if latest_version else 1

        # 创建标签和分类的快照
        tags_snapshot = json.dumps([tag.name for tag in note.tags])
        categories_snapshot = json.dumps([category.name for category in note.categories])

        version = NoteVersion(
            note_id=note.id,
            version_number=next_version,
            title=note.title,
            content=note.content,
            tags_snapshot=tags_snapshot,
            categories_snapshot=categories_snapshot,
            change_summary=change_summary,
            created_by=note.user_id
        )

        return version

    def __repr__(self):
        return f'<NoteVersion {self.note_id}:v{self.version_number}>'