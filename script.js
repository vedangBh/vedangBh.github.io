// Load the dataset (replace with your actual data source)
d3.csv("gdp_c.csv").then(function(data) {
    // Parse the data as needed
    // Example: Convert numerical strings to numbers using `+`

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

    // Function to draw the line chart
    function drawLineChart(data) {
        // Your code to draw the line chart goes here
    }

    // Call the function to draw the initial scene (e.g., Scene 1)
    drawLineChart(data.filter(d => d["Country Name"] === "Africa Eastern and Southern"));

    // Event listeners for scene buttons
    d3.select("#scene-1").on("click", function() {
        const sceneData = data.filter(d => d["Country Name"] === "Africa Eastern and Southern");
        drawLineChart(sceneData);
    });

    d3.select("#scene-2").on("click", function() {
        const sceneData = data.filter(d => d["Country Name"] === "Africa Western and Central");
        drawLineChart(sceneData);
    });

    // Add more event listeners for additional scenes as needed
});
