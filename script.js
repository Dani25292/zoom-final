d3.csv("updated_combined_data_with_russia.csv").then(data => {

  const width = 960;
  const height = 600;
  const colorScale = d3.scaleLinear()
                        .domain([1, 5]) // assuming 1 = unstable, 5 = very stable
                        .range(["#d73027", "#1a9850"]); // red to green

  const svg = d3.select("#map")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

  // Create a zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Set the zoom scale (1x to 8x zoom)
    .translateExtent([[0, 0], [width, height]]) // Limit panning to the map's extent
    .on("zoom", (event) => {
      mapGroup.attr("transform", event.transform); // Apply the zoom transformation
    });

  // Append a group to hold the map paths and enable zoom
  const mapGroup = svg.append("g");

  // Apply zoom to the SVG
  d3.select("#map").select("svg").call(zoom);

  const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("position", "absolute")
                    .style("background-color", "white")
                    .style("border", "1px solid black")
                    .style("padding", "5px")
                    .style("display", "none");

  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(geoData => {
    // Draw the map inside the group
    mapGroup.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath().projection(d3.geoMercator().scale(130).translate([width / 2, height / 1.5])))
      .attr("fill", d => {
        const countryData = data.filter(row => row.Country === d.properties.name && row.StabilityEstimate > 0 && row.StabilityEstimate !== "..");
        if (countryData.length > 0) {
          const latestYearData = countryData.reduce((a, b) => (+a.Year > +b.Year ? a : b)); // Get the latest year
          return colorScale(latestYearData.StabilityEstimate);
        } else {
          return "#f0f0f0"; // Gray for missing or invalid data
        }
      })
      .attr("stroke", "#d3d3d3")
      .on("mouseover", (event, d) => {
        const countryName = d.properties.name;
        tooltip.style("display", "block").text(countryName);
      })
      .on("mousemove", event => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"))
      .on("click", (event, d) => showCountryData(d.properties.name));
  }).catch(error => console.error("Error loading GeoJSON:", error));

  function showCountryData(country) {
    const countryData = data.filter(row => row.Country === country);

    if (countryData.length === 0) {
      alert("Data not available for " + country);
      return;
    }

    const years = countryData.map(row => +row.Year);
    const stability = countryData.map(row => +row.StabilityEstimate);
    const armsDeliveries = countryData.map(row => +row.ArmsDeliveries);

    // Arms Export Graph
    const armsTrace = {
      x: years,
      y: armsDeliveries,
      mode: 'lines+markers',
      name: 'Arms Export',
      line: { color: '#ff7f0e' }
    };

    const armsLayout = {
      title: `${country} - Arms Export Over Time`,
      xaxis: { title: 'Year' },
      yaxis: { title: 'Arms Export Value' }
    };

    // Stability Graph
    const stabilityTrace = {
      x: years,
      y: stability,
      mode: 'lines+markers',
      name: 'Political Stability',
      line: { color: '#1f77b4' }
    };

    const stabilityLayout = {
      title: `${country} - Political Stability Over Time`,
      xaxis: { title: 'Year' },
      yaxis: { title: 'Stability Level', range: [0, 5] } // Fixed y-axis range for consistency
    };

    Plotly.newPlot("arms-chart", [armsTrace], armsLayout);
    Plotly.newPlot("stability-chart", [stabilityTrace], stabilityLayout);
  }

  // Reset zoom button
  d3.select("#reset-zoom").on("click", () => {
    d3.select("#map").select("svg").transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity); // Reset to the initial scale and position
  });
});
