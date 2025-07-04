from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.get_json()
    
    # 验证数据
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': '缺少必要字段'}), 400
    
    # 检查用户名和邮箱是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': '邮箱已存在'}), 400
    
    # 创建新用户
    user = User(username=data['username'], email=data['email'])
    user.password = data['password']
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': '注册成功', 'user_id': user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    
    # 验证数据
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': '缺少必要字段'}), 400
    
    # 查找用户
    user = User.query.filter_by(username=data['username']).first()
    
    # 验证密码
    if not user or not user.verify_password(data['password']):
        return jsonify({'error': '用户名或密码错误'}), 401
    
    # 创建访问令牌
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': '登录成功',
        'token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(current_user_id)
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """获取用户个人资料"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(current_user_id)

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """更新用户资料"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(current_user_id)

    data = request.get_json()

    try:
        # 更新用户名
        if 'username' in data:
            username = data['username'].strip()
            if not username:
                return jsonify({'error': '用户名不能为空'}), 400

            # 检查用户名是否已存在（排除当前用户）
            existing_user = User.query.filter(
                User.username == username,
                User.id != current_user_id
            ).first()
            if existing_user:
                return jsonify({'error': '用户名已存在'}), 400

            user.username = username

        # 更新邮箱
        if 'email' in data:
            email = data['email'].strip()
            if not email:
                return jsonify({'error': '邮箱不能为空'}), 400

            # 检查邮箱是否已存在（排除当前用户）
            existing_user = User.query.filter(
                User.email == email,
                User.id != current_user_id
            ).first()
            if existing_user:
                return jsonify({'error': '邮箱已存在'}), 400

            user.email = email

        # 更新密码
        if 'newPassword' in data and data['newPassword']:
            current_password = data.get('currentPassword', '')
            new_password = data['newPassword']

            # 验证当前密码
            if not user.check_password(current_password):
                return jsonify({'error': '当前密码错误'}), 400

            # 验证新密码长度
            if len(new_password) < 6:
                return jsonify({'error': '新密码至少6位'}), 400

            user.password = new_password

        db.session.commit()

        return jsonify({
            'message': '个人资料更新成功',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat()
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新失败: {str(e)}'}), 500