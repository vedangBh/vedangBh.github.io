d3.csv("data/gdp_c.csv").then(function (data) {
    const margin = { top: 50, right: 50, bottom: 100, left: 100 };
    const width = 2500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3
      .select("#chart-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    data.forEach((d) => {
      for (let year = 1960; year <= 2020; year++) {
        d[year] = +d[year];
      }
    });
  
    const years = Array.from(Array(61), (_, i) => 1960 + i);
    const xScale = d3.scaleLinear().domain([0, years.length - 1]).range([0, width]);
  
    const slider = d3
      .sliderBottom(xScale)
      .min(0)
      .max(years.length - 1)
      .step(1)
      .width(width)
      .tickFormat((d) => years[d])
      .on("onchange", (val) => update(val));
  
    const gSlider = svg.append("g").attr("transform", `translate(0, ${height + margin.bottom / 2})`);
  
    gSlider.call(slider);
  
    function update(yearIndex) {
      const year = years[yearIndex];
      const selectedYearData = data.map((d) => ({
        CountryName: d["Country Name"],
        CountryCode: d["Country Code"],
        GDP: d[year],
      }));
  
      const maxGDP = d3.max(selectedYearData, (d) => d.GDP);
      const circleScale = d3.scaleSqrt().domain([0, maxGDP]).range([0, 30]);
      const circles = svg.selectAll("circle").data(selectedYearData, (d) => d.CountryCode);
  
      circles.exit().remove();
      circles
        .enter()
        .append("circle")
        .attr("cx", (d, i) => i * (width / selectedYearData.length))
        .attr("cy", height / 2)
        .attr("r", 0)
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            const mousePos = d3.pointer(event, this); // Get the mouse position relative to the hovered element
            tooltip
              .select("text")
              .style("font-size", "8px")
              .text(`Code: ${d.CountryCode}\nGDP: ${(d.GDP / 1e12).toFixed(4)} trillion USD`);
            tooltip.style("display", "block").attr("transform", `translate(${mousePos[0]}, ${mousePos[1] - 100})`);
          })
        .on("mouseout", function () {
          tooltip.style("display", "none");
        })
        .merge(circles)
        .transition()
        .duration(500)
        .attr("r", (d) => circleScale(d.GDP));
  
      const labels = svg.selectAll(".country-label").data(selectedYearData, (d) => d.CountryCode);
      labels.exit().remove();
  
      labels
        .enter()
        .append("text")
        .attr("class", "country-label")
        .attr("x", (d, i) => i * (width / selectedYearData.length))
        .attr("y", height / 2 + 40)
        .style("text-anchor", "middle")
        .style("font-size", "8px")
        .text((d) => d.CountryCode)
        .merge(labels);
  
      // Calculate the GDP changes for each country
      const gdpChanges = selectedYearData.map((d) => ({
        CountryCode: d.CountryCode,
        GDPChange: d.GDP - d[1960], // Change from the initial year (1960)
      }));
  
      // Find the country with the biggest and smallest GDP changes
      const maxGDPChange = d3.max(gdpChanges, (d) => d.GDPChange);
      const minGDPChange = d3.min(gdpChanges, (d) => d.GDPChange);
  
      // Filter the countries with the biggest and smallest GDP changes
      const biggestChangeCountry = gdpChanges.find((d) => d.GDPChange === maxGDPChange);
      const smallestChangeCountry = gdpChanges.find((d) => d.GDPChange === minGDPChange);
  
      // Add annotations for the countries with the biggest and smallest GDP changes
      const annotations = [
        {
          note: {
            label: `Biggest Change: ${biggestChangeCountry.CountryName}\nGDP Change: ${maxGDPChange.toFixed(
              2
            )} trillion USD`,
            title: "Biggest Change",
          },
          x: width / 4, // Position the annotation under the title
          y: -30,
          dx: 0,
          dy: 0,
          color: "red",
          type: d3.annotationCallout,
          subject: {
            radius: 10,
          },
        },
        {
          note: {
            label: `Smallest Change: ${smallestChangeCountry.CountryName}\nGDP Change: ${minGDPChange.toFixed(
              2
            )} trillion USD`,
            title: "Smallest Change",
          },
          x: (width / 4) * 3, // Position the annotation under the title
          y: -30,
          dx: 0,
          dy: 0,
          color: "green",
          type: d3.annotationCallout,
          subject: {
            radius: 10,
          },
        },
      ];
  
      // Create a new annotation layer
      const makeAnnotations = d3.annotation().annotations(annotations);
  
      // Remove the existing annotation layer if present
      svg.selectAll(".annotation-group").remove();
  
      // Append the new annotation layer to the SVG
      svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
    }
  
    const tooltip = svg.append("g").attr("class", "tooltip").style("display", "none");
  
    tooltip
      .append("rect")
      .attr("width", 150)
      .attr("height", 40)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", "rgba(0, 0, 0, 0.8)");
  
    tooltip
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "white")
      .style("font-size", "12px");
  
    update(0);
  });
  