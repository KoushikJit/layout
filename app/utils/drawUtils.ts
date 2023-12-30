import { DetectedObject, ObjectDetection } from "@tensorflow-models/coco-ssd";

export function drawOnCanvas(
  mirrored: boolean,
  predictions: DetectedObject[],
  ctx: CanvasRenderingContext2D | null | undefined
) {
  //   ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //get x, y, width, height
  predictions.forEach((detectedObject) => {
    const name = detectedObject.class;
    const score = detectedObject.score;
    const [x, y, width, height] = detectedObject.bbox;
    // drawAesthetic(ctx, x, y, width, height, name);

    if (ctx) {
      // styling
      const color = "#00B612";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 5;
      ctx.font = "12px Courier New";

      // draw with x, y, widht, height
      ctx.beginPath();
      // fill rect
      ctx.fillStyle = detectedObject.class === "person" ? "#FF0F0F" : "#00B612";
      ctx.globalAlpha = 0.4;
      if (mirrored) {
        ctx.roundRect(ctx.canvas.width - x, y, -width, height, 8);
      } else {
        ctx.roundRect(x, y, width, height, 8);
      }
      ctx.fill();

      //fill text
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      if (mirrored) {
        ctx.fillText(name, ctx.canvas.width - x - 100, y + 20);
      } else {
        ctx.fillText(name, x + 10, y + 20);
      }
    }
  });
}

export function drawPredictionOnCanvas(
  detectedObject: DetectedObject,
  ctx: CanvasRenderingContext2D | null | undefined
) {
  //   ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //get x, y, width, height
  const name = detectedObject.class;
  const score = detectedObject.score;
  const [x, y, width, height] = detectedObject.bbox;
  // drawAesthetic(ctx, x, y, width, height, name);

  if (ctx) {
    // styling
    ctx.font = "16px Courier";

    // draw with x, y, widht, height
    ctx.beginPath();

    // fill rect
    ctx.fillStyle = "#FF0F0F";
    ctx.globalAlpha = 0.4;
    ctx.roundRect(ctx.canvas.width - x, y, -width, height, 8);
    ctx.fill();

    //fill text
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillText(name, ctx.canvas.width - x - 100, y + 20);
  }
}
