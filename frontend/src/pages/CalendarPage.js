import React from "react";
import VipUpgradePrompt from "../components/VipUpgradePrompt";

const CalendarPage = () => {
  return (
    <VipUpgradePrompt
      featureName="日历视图"
      featureIcon="📅"
      description="按日历形式查看和管理笔记，支持日程安排和提醒功能"
      features={[
        "月视图、周视图、日视图切换",
        "事件创建和编辑",
        "智能提醒通知",
        "与笔记关联",
        "重复事件设置",
        "日程导出功能"
      ]}
    />
  );
};

export default CalendarPage;
