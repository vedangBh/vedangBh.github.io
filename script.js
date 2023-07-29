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
  
    function calculateAverageGDP(yearIndex) {
      const year = years[yearIndex];
      const selectedYearData = data.map((d) => d[year]);
      const totalGDP = selectedYearData.reduce((acc, gdp) => acc + gdp, 0);
      const averageGDP = totalGDP / selectedYearData.length;
      return (averageGDP / 1e12).toFixed(4); 
    }
  
    const averageGDPAnnotation = {
      note: {
        label: "",
        title: "Average GDP",
        wrap: 150,
      },
      connector: {
        end: "dot",
        type: "line",
      },
      x: 0,
      y: 0,
      dy: 60,
      dx: 0,
    };
  
    let timeout; 
  
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
          const mousePos = d3.pointer(event, this);
          tooltip
            .select("text")
            .style("font-size", "8px")
            .text(`Code: ${d.CountryCode}\nGDP: ${(d.GDP / 1e12).toFixed(4)} trillion USD`);
          tooltip
            .style("display", "block")
            .attr("transform", `translate(${mousePos[0]}, ${mousePos[1] - 100})`);
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
  
      const gdpChanges = selectedYearData.map((d) => ({
        CountryCode: d.CountryCode,
        GDPChange: d.GDP - d[1960],
      }));
  
      const maxGDPChange = d3.max(gdpChanges, (d) => d.GDPChange);
      const minGDPChange = d3.min(gdpChanges, (d) => d.GDPChange);
  
      const biggestChangeCountry = gdpChanges.find((d) => d.GDPChange === maxGDPChange);
      const smallestChangeCountry = gdpChanges.find((d) => d.GDPChange === minGDPChange);
  

  
      const makeAnnotations = d3.annotation().annotations(annotations);
  
      svg.selectAll(".annotation-group").remove();
  
      svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
  
      clearTimeout(timeout);
  
      timeout = setTimeout(() => {
        const averageGDP = calculateAverageGDP(yearIndex);
        averageGDPAnnotation.note.label = `Average GDP in ${years[yearIndex]}: ${averageGDP} trillion USD`;
        averageGDPAnnotation.x = yearIndex * (width / (years.length - 1));  
        averageGDPAnnotation.y = height + margin.bottom / 2; 
        svg.selectAll(".annotation-group").remove();
        const makeAnnotations = d3.annotation().annotations([averageGDPAnnotation]);
        svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
      }, 3000);
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
  
    const yearSlider = document.getElementById("year-slider");
    yearSlider.setAttribute("min", "0");
    yearSlider.setAttribute("max", (years.length - 1).toString());
    yearSlider.setAttribute("step", "1");
    yearSlider.setAttribute("value", "0");
  
    yearSlider.addEventListener("input", function () {
      update(+this.value);
    });
  
    const sliderLabels = years.map((year, index) => ({
      position: xScale(index),
      label: year.toString(),
    }));
  
    const sliderGroup = svg
      .append("g")
      .attr("class", "slider-group")
      .attr("transform", `translate(0, ${height + margin.bottom / 2})`);
  
    sliderGroup
      .selectAll(".slider-label")
      .data(sliderLabels)
      .enter()
      .append("text")
      .attr("class", "slider-label")
      .attr("x", (d) => d.position)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text((d) => d.label);
  
    update(0);
  });
  