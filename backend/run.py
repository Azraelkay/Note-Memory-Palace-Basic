import os
from app import create_app, db
from flask_migrate import upgrade

# 创建应用实例
app = create_app(os.getenv('FLASK_CONFIG') or 'default')

@app.shell_context_processor
def make_shell_context():
    """为Flask shell添加上下文"""
    return dict(app=app, db=db)

if __name__ == '__main__':
    app.run(debug=True) 