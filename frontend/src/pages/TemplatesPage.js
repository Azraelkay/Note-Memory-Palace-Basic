import React from "react";
import VipUpgradePrompt from "../components/VipUpgradePrompt";

const TemplatesPage = () => {
  return (
    <VipUpgradePrompt
      featureName="模板库"
      featureIcon="📄"
      description="提供各种笔记模板，快速创建格式化的笔记内容"
      features={[
        "丰富的预设模板",
        "自定义模板创建",
        "模板分类管理",
        "一键应用模板",
        "模板分享功能",
        "智能模板推荐"
      ]}
    />
  );
};

export default TemplatesPage;
