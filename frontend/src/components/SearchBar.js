import React, { useState, useEffect } from 'react';
import { getTags, getCategories } from '../services/api';

const SearchBar = ({ onSearch, onClear, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 加载标签和分类
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [tagsData, categoriesData] = await Promise.all([
          getTags(),
          getCategories()
        ]);
        setTags(tagsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('加载过滤选项失败:', error);
      }
    };

    loadFilters();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    const searchParams = {
      q: searchTerm.trim(),
      tags: selectedTags.join(','),
      categories: selectedCategories.join(','),
      date_from: dateFrom,
      date_to: dateTo
    };

    // 移除空值
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key]) {
        delete searchParams[key];
      }
    });

    onSearch(searchParams);
  };

  // 处理清除
  const handleClear = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedCategories([]);
    setDateFrom('');
    setDateTo('');
    onClear();
  };

  // 处理标签选择
  const handleTagToggle = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  // 处理分类选择
  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // 处理回车搜索
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button 
            className="search-button"
            onClick={handleSearch}
            title="搜索"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button 
            className="advanced-button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            title="高级搜索"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-search">
            <div className="filter-section">
              <h4>标签</h4>
              <div className="filter-tags">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`filter-tag ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle(tag.name)}
                  >
                    {tag.name} ({tag.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>分类</h4>
              <div className="filter-categories">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`filter-category ${selectedCategories.includes(category.name) ? 'selected' : ''}`}
                    onClick={() => handleCategoryToggle(category.name)}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>日期范围</h4>
              <div className="date-range">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="开始日期"
                />
                <span>至</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="结束日期"
                />
              </div>
            </div>

            <div className="search-actions">
              <button className="btn btn-secondary" onClick={handleClear}>
                清除
              </button>
              <button className="btn" onClick={handleSearch}>
                搜索
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .search-bar-container {
          margin-bottom: 2rem;
        }

        .search-bar {
          background: var(--card-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 1rem;
        }

        .search-input-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .search-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 16px;
          transition: var(--transition);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-button, .advanced-button {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          padding: 10px;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-button:hover, .advanced-button:hover {
          background: #2563eb;
        }

        .search-button svg, .advanced-button svg {
          width: 20px;
          height: 20px;
        }

        .advanced-search {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .filter-section {
          margin-bottom: 1.5rem;
        }

        .filter-section h4 {
          margin-bottom: 0.5rem;
          color: var(--text-color);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .filter-tags, .filter-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-tag, .filter-category {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .filter-tag:hover, .filter-category:hover {
          border-color: var(--primary-color);
        }

        .filter-tag.selected, .filter-category.selected {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-range input {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 14px;
        }

        .date-range span {
          color: var(--text-light);
          font-size: 14px;
        }

        .search-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .search-input-container {
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }

          .date-range {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .search-actions {
            justify-content: stretch;
          }

          .search-actions button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
