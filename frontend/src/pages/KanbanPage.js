import React from "react";
import VipUpgradePrompt from "../components/VipUpgradePrompt";

const KanbanPage = () => {
  return (
    <VipUpgradePrompt
      featureName="看板管理"
      featureIcon="📋"
      description="Kanban风格的任务管理，将笔记组织成待办、进行中、已完成状态"
      features={[
        "拖拽式任务管理",
        "自定义看板列",
        "任务优先级设置",
        "进度跟踪",
        "团队协作",
        "数据统计分析"
      ]}
    />
  );
};

export default KanbanPage;
