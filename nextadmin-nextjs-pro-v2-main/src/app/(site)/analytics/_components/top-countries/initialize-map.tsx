import jsVectorMap from "jsvectormap";
import "jsvectormap/dist/maps/world";

export default function initializeVectorMap() {
  new jsVectorMap({
    selector: "#mapTwo",
    map: "world",
    zoomButtons: true,
    regionStyle: {
      initial: {
        fill: "#A9BDFF",
      },
      hover: {
        fillOpacity: 1,
        fill: "#3056D3",
      },
    },
  });

  return null;
}
