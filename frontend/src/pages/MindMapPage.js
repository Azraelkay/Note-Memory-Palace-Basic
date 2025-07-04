import React from "react";
import VipUpgradePrompt from "../components/VipUpgradePrompt";

const MindMapPage = () => {
  return (
    <VipUpgradePrompt
      featureName="思维导图"
      featureIcon="🧠"
      description="创建和编辑思维导图，可视化您的想法和知识结构"
      features={[
        "节点拖拽编辑",
        "多样式自定义",
        "图片导出功能",
        "协作编辑",
        "模板库支持",
        "智能布局算法"
      ]}
    />
  );
};

export default MindMapPage;
