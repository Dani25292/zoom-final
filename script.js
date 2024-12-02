// Load data
d3.csv("updated_combined_data_with_russia.csv").then(data => {
  const width = 960;
  const height = 600;

  // Define color scale
  const colorScale = d3.scaleLinear()
    .domain([1, 5]) // Stability values between 1 (low) and 5 (high)
    .range(["#d73027", "#1a9850"]);

  // Create SVG
  const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(
      d3.zoom()
        .scaleExtent([1, 8]) // Allow zoom between 1x and 8x
        .on("zoom", (event) => {
          svg.selectAll("g").attr("transform", event.transform);
        })
    )
    .append("g");

  // Tooltip for country names
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("display", "none");

  // Load GeoJSON
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(geoData => {
    // Draw map
    svg.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath().projection(d3.geoMercator().scale(130).translate([width / 2, height / 1.5])))
      .attr("fill", d => {
        const countryData = data.find(row => row.Country === d.properties.name);
        return countryData && countryData.StabilityEstimate !== ".."
          ? colorScale(countryData.StabilityEstimate)
          : "#f0f0f0"; // Gray for missing data
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

  // Function to display country data in graphs
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
      yaxis: {
        title: 'Stability Level',
        range: [1, 5] // Fixed range for all countries
      }
    };

    Plotly.newPlot("arms-chart", [armsTrace], armsLayout);
    Plotly.newPlot("stability-chart", [stabilityTrace], stabilityLayout);
  }
});
