import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

const RiveWrapper = () => {
  const { RiveComponent } = useRive({
    src: "btn.riv",
    stateMachines: "Motion",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center
    })
  });

  return <RiveComponent />;
};

export default RiveWrapper;