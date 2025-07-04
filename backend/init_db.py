"""
初始化数据库脚本
用法：python init_db.py
"""

import os
import sys
from app import create_app, db
from app.models import User, Note, Tag, Category, NoteVersion
from werkzeug.security import generate_password_hash

def init_db():
    """初始化数据库"""
    print("正在初始化数据库...")

    # 创建应用上下文
    app = create_app('development')
    with app.app_context():
        try:
            # 删除所有表（如果存在）
            print("删除现有表...")
            db.drop_all()

            # 创建所有表
            print("创建数据库表...")
            db.create_all()

            # 创建示例数据
            create_sample_data()

            print("数据库初始化完成！")

        except Exception as e:
            print(f"数据库初始化失败: {e}")
            sys.exit(1)

def create_sample_data():
    """创建示例数据"""
    print("创建示例数据...")

    # 创建示例用户
    demo_user = User(
        username='demo',
        email='demo@example.com'
    )
    demo_user.password = 'demo123'  # 使用属性设置器自动哈希

    db.session.add(demo_user)
    db.session.commit()

    # 创建示例分类
    work_category = Category(
        name='工作',
        description='工作相关的笔记',
        color='#3B82F6',
        icon='💼',
        user_id=demo_user.id
    )

    study_category = Category(
        name='学习',
        description='学习笔记和资料',
        color='#10B981',
        icon='📚',
        user_id=demo_user.id
    )

    life_category = Category(
        name='生活',
        description='日常生活记录',
        color='#F59E0B',
        icon='🏠',
        user_id=demo_user.id
    )

    db.session.add_all([work_category, study_category, life_category])
    db.session.commit()

    # 创建示例标签
    tags_data = ['重要', '待办', '想法', '代码', '会议']
    tags = []
    for tag_name in tags_data:
        tag = Tag(name=tag_name)
        tags.append(tag)
        db.session.add(tag)

    db.session.commit()

    # 创建示例笔记
    welcome_note = Note(
        title='欢迎使用Note',
        content='''这是一个功能强大的笔记应用，您可以：

1. 创建和编辑笔记
2. 使用分类和标签组织笔记
3. 搜索和筛选笔记
4. 上传图片和附件

开始您的笔记之旅吧！''',
        user_id=demo_user.id
    )

    code_note = Note(
        title='代码片段示例',
        content='''这里是一些常用的代码片段：

```javascript
// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

```python
# Python 列表推导式
squares = [x**2 for x in range(10)]
print(squares)
```''',
        user_id=demo_user.id
    )

    db.session.add_all([welcome_note, code_note])

    # 添加分类关联
    welcome_note.categories.append(life_category)
    code_note.categories.append(work_category)

    # 添加标签关联
    welcome_note.tags.append(tags[0])  # 重要
    code_note.tags.append(tags[3])     # 代码

    db.session.commit()

    # 为示例笔记创建初始版本
    welcome_version = welcome_note.create_version("初始版本")
    code_version = code_note.create_version("初始版本")

    db.session.commit()

    print(f"创建了示例用户: {demo_user.username}")
    print(f"创建了 {len([work_category, study_category, life_category])} 个分类")
    print(f"创建了 {len(tags)} 个标签")
    print(f"创建了 2 篇示例笔记")
    print(f"创建了 2 个笔记版本")

    # 初始化扩展数据
    from init_extensions import init_extensions
    init_extensions()

    # 初始化模板数据
    from init_templates import init_templates
    init_templates()

if __name__ == '__main__':
    init_db()