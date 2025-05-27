import React, { useRef, useState } from "react";

const BackgroundRemover = () => {
  const [processedImage, setProcessedImage] = useState(null);
  const fileInputRef = useRef();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // avoid CORS issues on canvas
    img.onload = () => removeBackgroundAndScale(img);
    img.src = URL.createObjectURL(file);
  };

  const removeBackgroundAndScale = (img) => {
    // Step 1: Remove background from original image size
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > 230 && g > 230 && b > 230) {
        data[i + 3] = 0;
      }
    }
    tempCtx.putImageData(imgData, 0, 0);

    // Step 2: Scale the entire image (with transparent bg) to 192x192 px
    const scaleSize = 192;
    const scaleCanvas = document.createElement("canvas");
    const scaleCtx = scaleCanvas.getContext("2d");

    scaleCanvas.width = scaleSize;
    scaleCanvas.height = scaleSize;

    // Clear and draw scaled image
    scaleCtx.clearRect(0, 0, scaleSize, scaleSize);
    scaleCtx.drawImage(tempCanvas, 0, 0, img.width, img.height, 0, 0, scaleSize, scaleSize);

    setProcessedImage(scaleCanvas.toDataURL("image/png"));
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
      />
      {processedImage && (
        <img
          src={processedImage}
          alt="Processed"
          style={{ width: "192px", height: "192px", border: "1px solid #ccc" }}
        />
      )}
    </div>
  );
};

export default BackgroundRemover;
