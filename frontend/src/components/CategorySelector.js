import React, { useState, useEffect, useRef } from 'react';
import { getCategories } from '../services/api';

const CategorySelector = ({
  selectedCategories = [],
  onCategoryChange,
  multiple = true,
  autoCollapse = true // 新增：控制是否自动收起
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories({ tree: false }); // 获取扁平列表
        setCategories(data);
      } catch (error) {
        console.error('加载分类失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // 获取分类的完整路径
  const getCategoryPath = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';

    const buildPath = (cat) => {
      if (!cat.parent_id) return cat.name;
      const parent = categories.find(c => c.id === cat.parent_id);
      return parent ? `${buildPath(parent)} > ${cat.name}` : cat.name;
    };

    return buildPath(category);
  };

  // 处理分类选择
  const handleCategoryToggle = (categoryId) => {
    if (multiple) {
      const newSelected = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
      onCategoryChange(newSelected);

      // 根据用户偏好，选择后自动收起下拉菜单
      if (autoCollapse) {
        setTimeout(() => {
          setShowDropdown(false);
        }, 150); // 添加短暂延迟，让用户看到选择效果
      }
    } else {
      onCategoryChange(selectedCategories.includes(categoryId) ? [] : [categoryId]);
      setShowDropdown(false);
    }
  };

  // 获取选中分类的显示文本
  const getSelectedText = () => {
    if (selectedCategories.length === 0) {
      return '选择分类';
    }
    
    if (selectedCategories.length === 1) {
      return getCategoryPath(selectedCategories[0]);
    }
    
    return `已选择 ${selectedCategories.length} 个分类`;
  };

  // 按层级分组分类
  const groupCategoriesByLevel = () => {
    const grouped = {};
    categories.forEach(category => {
      const level = category.parent_id ? 1 : 0; // 简化：只显示两级
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(category);
    });
    return grouped;
  };

  if (loading) {
    return <div className="category-selector loading">加载分类中...</div>;
  }

  return (
    <div className="category-selector" ref={dropdownRef}>
      <div
        className="selector-trigger"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="selected-text">{getSelectedText()}</span>
        <svg 
          className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {showDropdown && (
        <div className="dropdown-menu">
          {categories.length === 0 ? (
            <div className="empty-message">暂无分类</div>
          ) : (
            <div className="category-list">
              {categories
                .filter(cat => !cat.parent_id) // 先显示根分类
                .map(category => (
                  <div key={category.id}>
                    <div
                      className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div className="category-info">
                        <div 
                          className="category-color"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="category-name">{category.name}</span>
                        {category.description && (
                          <span className="category-description">- {category.description}</span>
                        )}
                      </div>
                      {multiple && (
                        <div className="checkbox">
                          {selectedCategories.includes(category.id) ? '✓' : ''}
                        </div>
                      )}
                    </div>
                    
                    {/* 显示子分类 */}
                    {categories
                      .filter(cat => cat.parent_id === category.id)
                      .map(subCategory => (
                        <div
                          key={subCategory.id}
                          className={`category-option sub-category ${selectedCategories.includes(subCategory.id) ? 'selected' : ''}`}
                          onClick={() => handleCategoryToggle(subCategory.id)}
                        >
                          <div className="category-info">
                            <div 
                              className="category-color"
                              style={{ backgroundColor: subCategory.color }}
                            ></div>
                            <span className="category-name">{subCategory.name}</span>
                            {subCategory.description && (
                              <span className="category-description">- {subCategory.description}</span>
                            )}
                          </div>
                          {multiple && (
                            <div className="checkbox">
                              {selectedCategories.includes(subCategory.id) ? '✓' : ''}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .category-selector {
          position: relative;
          width: 100%;
        }

        .selector-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--background-color);
          cursor: pointer;
          transition: var(--transition);
        }

        .selector-trigger:hover {
          border-color: var(--primary-color);
        }

        .selected-text {
          color: var(--text-color);
          flex: 1;
          text-align: left;
        }

        .dropdown-arrow {
          width: 20px;
          height: 20px;
          color: var(--text-light);
          transition: transform 0.2s;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--card-color);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
        }

        .category-list {
          padding: 0.5rem 0;
        }

        .category-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .category-option:hover {
          background: var(--border-color);
        }

        .category-option.selected {
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary-color);
        }

        .sub-category {
          padding-left: 2rem;
          border-left: 2px solid var(--border-color);
          margin-left: 1rem;
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .category-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
        }

        .category-name {
          font-weight: 500;
        }

        .category-description {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--primary-color);
        }

        .empty-message {
          padding: 1rem;
          text-align: center;
          color: var(--text-light);
        }

        .loading {
          padding: 0.75rem;
          text-align: center;
          color: var(--text-light);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
        }
      `}</style>
    </div>
  );
};

export default CategorySelector;
