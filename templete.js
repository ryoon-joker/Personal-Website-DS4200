// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function (d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 30, bottom: 60, left: 60},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PetalLength)).nice()
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PetalWidth)).nice()
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Species));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Petal Length (cm)");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Petal Width (cm)");

    // Add legend (Bottom right - to avoid overlapping with graph points)
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 80}, ${height - 60})`);  // Adjusted for bottom-right corner

    const species = colorScale.domain();
    species.forEach((species, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("circle")
            .attr("r", 5)
            .attr("fill", colorScale(species));

        legendRow.append("text")
            .attr("x", 15)
            .attr("y", 5)
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .text(species);
    });

    iris.then(function (data) {
        // Convert string values to numbers
        data.forEach(d => d.PetalLength = +d.PetalLength);

        // Define the dimensions and margins for the SVG
        const margin = {top: 30, right: 30, bottom: 60, left: 60},
            width = 600 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Create the SVG container
        const svg = d3.select("#boxplot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up scales for x and y axes
        const xScale = d3.scaleBand()
            .domain([...new Set(data.map(d => d.Species))])
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.PetalLength)]).nice()
            .range([height, 0]);

        // Add scales
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add x-axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Species");

        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Petal Length (cm)");

        const rollupFunction = function (groupData) {
            const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
            const q1 = d3.quantile(values, 0.25);
            const median = d3.quantile(values, 0.5);
            const q3 = d3.quantile(values, 0.75);
            const iqr = q3 - q1;
            return {q1, median, q3, iqr};
        };

        const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

        quartilesBySpecies.forEach((quartiles, species) => {
            const x = xScale(species);
            const boxWidth = xScale.bandwidth();

            // Draw vertical lines
            svg.append("line")
                .attr("x1", x + boxWidth / 2)
                .attr("x2", x + boxWidth / 2)
                .attr("y1", yScale(quartiles.q1 - 1.5 * quartiles.iqr))
                .attr("y2", yScale(quartiles.q3 + 1.5 * quartiles.iqr))
                .attr("stroke", "black");

            // Draw box
            svg.append("rect")
                .attr("x", x)
                .attr("width", boxWidth)
                .attr("y", yScale(quartiles.q3))
                .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
                .attr("fill", "lightgrey");

            // Draw median line
            svg.append("line")
                .attr("x1", x)
                .attr("x2", x + boxWidth)
                .attr("y1", yScale(quartiles.median))
                .attr("y2", yScale(quartiles.median))
                .attr("stroke", "black");
        });
    });
});
