import React from "react";
import { SegmentationResultView } from "./SegmentationResultView";

interface Props {
  videoId?: string;
  onBack?: () => void;
}

export const VideoSegmentationResultView: React.FC<Props> = ({
  videoId,
  onBack,
}) => {
  return (
    <SegmentationResultView
      videoId={videoId}
      type="video"
      onBack={onBack}
    />
  );
};

export default VideoSegmentationResultView;
