import React from "react";
import { useParams } from "react-router-dom";
import { SegmentationResultView } from "../components/SegmentationResultView";

interface SegmentationResultPageProps {
  type?: "photo" | "video";
}

export const SegmentationResultPage: React.FC<SegmentationResultPageProps> = ({
  type,
}) => {
  const { photoId, videoId } = useParams<{
    photoId?: string;
    videoId?: string;
  }>();

  return (
    <SegmentationResultView
      photoId={photoId}
      videoId={videoId}
      type={type}
    />
  );
};

export default SegmentationResultPage;

