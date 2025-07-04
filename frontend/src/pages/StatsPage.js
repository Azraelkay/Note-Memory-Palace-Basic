import React from "react";
import VipUpgradePrompt from "../components/VipUpgradePrompt";

const StatsPage = () => {
  return (
    <VipUpgradePrompt
      featureName="数据统计"
      featureIcon="📊"
      description="分析笔记数据，提供写作统计和使用习惯分析"
      features={[
        "写作统计分析",
        "使用习惯追踪",
        "趋势图表展示",
        "数据报告生成",
        "效率分析",
        "目标设定与跟踪"
      ]}
    />
  );
};

export default StatsPage;
