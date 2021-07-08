////// STEP 1: Use D3 library to read in samples.json and add data.names to the dropdown menu. //////
var data = d3.json("data/samples.json").then((data) => {
     console.log(data)
     
     var sampleNames = data.names;
     // console.log(sampleNames);
     
     sampleNames.forEach((sample) => {
     d3.select("#selDataset").append("option").text(sample).property("value", sample);
     });

 ////// STEP 2: Initiallize page with default plots. //////

     function init() {
          //console.log(data);
          //set ID No.940 as default plot
          defaultDataset = data.samples[0];
          //console.log(defaultDataset)

          //select ALL sample_values, otu_ids, and otu_labels
          allSampleValuesDefault = defaultDataset.sample_values;
		allOtuIdsDefault = defaultDataset.otu_ids;
		allOtuLabelsDefault = defaultDataset.otu_labels;

          // BAR CHART //

          //sellect TOP 10 OTU's for the ID with sample_values, otu_ids, and otu_labels
          default_sampleValues = allSampleValuesDefault.slice(0,10);
          default_otu_ids = allOtuIdsDefault.slice(0,10);
          default_otu_labels = allOtuLabelsDefault.slice(0,10);
//         console.log(default_otu_ids);
//         console.log(default_sampleValues)

          //plot horizontal bar chart
          trace1 = [{
               type: 'bar',
               x: default_sampleValues,
               y: default_otu_ids.map(default_otu_ids => `OTU ${default_otu_ids}`),
               text: default_otu_labels,
               orientation: 'h',
          }];

          var barData = trace1;
          
          var barLayout = {
               title: `<b>Top 10 Bacteria Cultures Found`,
               xaxis: {title: "Sample Value"},
               yaxis: {autorange: "reversed"},
               // width: 450,
               // height: 600,
          }

          var config = {responsive: true}

          Plotly.newPlot('bar', barData, barLayout, config);

          // BUBBLE CHART //

          var trace2 = [{
               x: allOtuIdsDefault,
               y: allSampleValuesDefault,
               text: allOtuLabelsDefault,
               mode: 'markers',
               marker: {
				color: allOtuIdsDefault,
				size: allSampleValuesDefault
			}
          }];

          var bubbleData = trace2
          
          var bubbleLayout = {
               title: '<b>Bacteria Cultures Per Sample',
			xaxis: { title: "OTU ID"},
			yaxis: { title: "Sample Value"}, 
			showlegend: false,
		};
		
		Plotly.newPlot('bubble', bubbleData, bubbleLayout, config);
          
          // DEMOGRAPHICS TABLE //

          //Grab default metadata array 
          var defaultDemo = data.metadata[0];
//         console.log(defaultDemo);
          //console.log(data.metadata);

          //Display key-value pairs from metadata JSON object
          Object.entries(defaultDemo).forEach(
               ([key, value]) => d3.select("#sample-metadata").append("p").text(`${key.toUpperCase()}: ${value}`)
          );

          // GAUGE CHART //

          //Grab washing frequency attribute from metadata JSON object
          var defaultWfreq = defaultDemo.wfreq
//          console.log(defaultWfreq);
          
          //Build guage chart
          var trace3 = [
               {
                    domain: { x: [0, 1], y: [0, 1] },
                    value: defaultWfreq,
                    title: { text: '<b> Belly Button Washing Frequency </b> <br>Scrubs per Week'},
                    type: "indicator",
                    mode: "gauge+number",
                    //Add steps to display gradual color change of range
                    gauge: {
                         axis: {range: [null, 9]},
                         steps: [
                              { range: [0, 1], color: 'rgb(248, 243, 236)' },
                              { range: [1, 2], color: 'rgb(245, 246, 230)' },
                              { range: [2, 3], color: 'rgb(233, 230, 202)' },
                              { range: [3, 4], color: 'rgb(229, 231, 179)' },
                              { range: [4, 5], color: 'rgb(213, 228, 157)' },
                              { range: [5, 6], color: 'rgb(183, 204, 146)' },
                              { range: [6, 7], color: 'rgb(140, 191, 136)' },
                              { range: [7, 8], color: 'rgb(138, 187, 143)' },
                              { range: [8, 9], color: 'rgb(133, 180, 138)' },
                         ]
                    }
               }
          ];

          var gaugeData=trace3;

          var config = {responsive: true}

          // var guageLayout = {width: 600, height:450, margin: {t:0, b:0}};
          var guageLayout = {margin: {t:0, b:0}};

          Plotly.newPlot('gauge', gaugeData, guageLayout, config);
          
          //call update when a change takes place to the DOM
          d3.select("#selDataset").on("change", updatePlotly);
     };

////// STEP 3. Create updatePlotly function //////

          //create updatePlotly to initiate when a new ID is selected
           function updatePlotly() {

     //           //use d# to select dropdown menu
                var dropdownMenu = d3.select("#selDataset").node();
                // Assign the value of the dropdown menu option to a variable
                var inputValue = dropdownMenu.value;
                console.log(inputValue);

                //filter dataset based on inputValue entered
                dataset = data.samples.filter(sample => sample.id === inputValue) [0];
               //console.log(dataset);

                ////// STEP 4. Update plots when change occurs //////

     //         //select all sample_values, otu_ids, otu_labels, of each selected test ID
                allSampleValues = dataset.sample_values;
                allOtuIds = dataset.otu_ids;
                allOtuLabels = dataset.otu_labels;
     //          console.log(allSampleValues)

               // RESTYLE BAR CHART //
                top10Values = allSampleValues.slice(0,10);
                top10Ids = allOtuIds.slice(0,10).map(default_otu_ids => `OTU ${default_otu_ids}`);
                top10Labels = allOtuLabels.slice(0,10);

                Plotly.restyle("bar", "x", [top10Values]);
                Plotly.restyle("bar", "y", [top10Ids]);
                Plotly.restyle["bar", "text", [top10Labels]];

                // RESTYLE BUBBLE CHART //
                Plotly.restyle("bubble", "x", [allOtuIds]);
                Plotly.restyle("bubble", "y", [allSampleValues]);
                Plotly.restyle("bubble", "text", [allOtuLabels]);

                // RESTYLE DEMOGRAPHICS TABLE //    
                var allDemo = data.metadata.filter(sample => sample.id == inputValue)[0];
                console.log(allDemo);

               //Set 'sample-metadata' div to empty to reset table
               d3.select("#sample-metadata").html(""); 

               //Display key-value pairs from metadata JSON object
               Object.entries(allDemo).forEach( 
               ([key, value]) => d3.select("#sample-metadata").append("p").text(`${key.toUpperCase()}: ${value}`)
          ); 
               // RESTYLE GAUGE CHART //
               var newGauge = allDemo.wfreq;

               Plotly.restyle("gauge", "value", [newGauge])
               
          };

          init();
      
     });