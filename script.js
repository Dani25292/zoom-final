const svg = d3.select("#map")
  .append("svg")
  .attr("width", 960)
  .attr("height", 600);

const g = svg.append("g");

// Define zoom behavior
const zoom = d3.zoom()
  .scaleExtent([1, 8]) // Set zoom limits
  .translateExtent([[0, 0], [960, 600]]) // Set pan limits
  .on("zoom", (event) => {
    g.attr("transform", event.transform); // Apply zoom/pan transformations
  });

// Attach zoom behavior to the SVG
svg.call(zoom);

// Load map data and render it (assuming a topoJSON format)
d3.json("path/to/map-data.json").then((data) => {
  const projection = d3.geoMercator().scale(150).translate([480, 300]);
  const path = d3.geoPath().projection(projection);

  g.selectAll("path")
    .data(topojson.feature(data, data.objects.countries).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "lightgray")
    .attr("stroke", "white")
    .on("click", (event, d) => {
      // Handle country click
      console.log("Country clicked:", d.properties.name);
    });
});
