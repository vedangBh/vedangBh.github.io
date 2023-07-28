// Load the dataset (replace with your actual data source)
d3.csv("vedangBh.github.io
/gdp_c.csv").then(function(data) {
    // Parse the data as needed
    data.forEach(d => {
        d.GDP = +d["1960"]; // Convert GDP values to numbers
    });

    // Set up chart dimensions and margins
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.GDP)])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d["Country Name"]))
        .range([0, height])
        .padding(0.2);

    // Function to update the chart based on the selected year
    function updateChart(year) {
        const newData = data.map(d => ({
            country: d["Country Name"],
            gdp: +d[year]
        }));

        const circles = svg.selectAll("circle")
            .data(newData, d => d.country);

        circles.enter()
            .append("circle")
            .merge(circles)
            .transition()
            .duration(500)
            .attr("cx", d => xScale(d.gdp))
            .attr("cy", d => yScale(d.country) + yScale.bandwidth() / 2)
            .attr("r", d => Math.sqrt(d.gdp) / 5) // Adjust the circle size based on GDP value
            .style("fill", "steelblue");

        circles.exit()
            .remove();
    }

    // Call the updateChart function initially with the default year
    updateChart("1960");

    // Event listener for the year slider
    d3.select("#yearRange").on("input", function() {
        const selectedYear = this.value;
        d3.select("#yearValue").text(selectedYear);
        updateChart(selectedYear);
    });
});
