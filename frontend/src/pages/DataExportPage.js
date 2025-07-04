import React from "react";
import VipUpgradePrompt from "../components/VipUpgradePrompt";

const DataExportPage = () => {
  return (
    <VipUpgradePrompt
      featureName="数据导出"
      featureIcon="📤"
      description="将笔记导出为PDF、Word、Excel等多种格式"
      features={[
        "PDF格式导出",
        "Word文档导出",
        "Markdown导出",
        "批量导出功能",
        "自定义导出模板",
        "云端备份同步"
      ]}
    />
  );
};

export default DataExportPage;
