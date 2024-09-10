/*
PROJECT
Time series analysis of agricultural and forestry use in the municipality of Sinop/MT, based on the MapBiomas project (Collection 8 / 1985 - 2022).

OBJECTIVES 
Obtain and analyze the following metrics:

METRIC 1 - MODE 
Highlight the evolution of the main Agricultural/Forestry use during the time series.

METRIC 2.1 - HISTOGRAM: PIXELS 
Generate a histogram and .csv of the data by class and by year for the metric: pixels.

METRIC 2.2 - HISTOGRAM: AREA 
Generate a histogram and .csv of the data by class and by year for the metric: area (hectare - ha).

METRIC 3 - FREQUENCY 
Assess the intensity of use for each agricultural/forestry use class during the period.


INITIAL FINDINGS

METRIC 1 - MODE 
Until the year 2008, the predominant class in the municipality of Sinop (MT) was 'Forest Formation'. From 2009 onwards, the 'Soybean' class gained greater relevance, indicating a trend of land use conversion in the municipality.

METRIC 2.1 - HISTOGRAM: PIXELS 
The histograms indicates the gradual reduction of the 'Forest Formation' class, with a decrease in the conversion rate starting in 2012. 
Between 1985 and 2003, 'Pasture' gained ground and relevance at the expense of 'Forest Formation'. From 2004 onwards, the scenario changed, and it was the 'Soybean' class that showed significant growth at the expense of 'Forest Formation' and 'Pasture'.

METRIC 2.2 - HISTOGRAM: AREA 
This KPI draws the same conclusions as the previous metric, but from the perspective of the occupied area (in hectares). The calculation in this area unit is more suitable for estimating economic calculations and projections/predictions of future uses.

METRIC 3 - FREQUENCY 
In the cumulative time series data, it is highlighted that: 
For occupied area, 'Soybean' has been notably the main agricultural activity in the municipality, except in the northwest region of the territory, where 'Pastures' predominate. 
'Soybean' occupies 169 thousand hectares in 2022, compared to 403 hectares in 1985. 
'Forestry' is minimally representative within the context of the municipality (429 ha in 2022). 
'Other Perennial Crops' are visually distributed homogeneously across the municipality's territory. 
The area occupied by 'Forest Formation' has decreased by 58% during the period, currently occupying 148 thousand hectares.


NEXT STEPS 
- Calculation of complementary metrics derived from this initial analysis/exploration; 
- Refinement of the charts; 
- Creation of dynamic/animated histograms indicating the annual evolution of the classes; 
- Refactoring; 
- Final tests; 
- Review and documentation refinement; 
- Export the data and deliverable products.
*/

// STEP 1 - Resources and AOI (Area of Interest)

// Importing MapBiomas - Collection 8 - Dataset
var mapbiomas = ee.Image('projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1');

// MapBiomas' 8 Color palette 
var palettes = require('users/mapbiomas/modules:Palettes.js');
var paletteMapBiomas = palettes.get('classification8');

// Geometry (AOI) (Sinop Municipality)
var sinop = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/municipios-2016')
    .filter(ee.Filter.eq('NM_MUNICIP','SINOP'))

// Centers the map on the geometry and adds the geometry to the render
Map.centerObject(sinop, 8);
Map.addLayer(sinop, {color: 'red'}, 'Sinop');

///////////////////////////////////////////////////////////////////

// STEP 2 - METRICS CALCULATION AND VISUALIZATION

// METRIC 1 - Mode (Class with the highest frequency of occurrence per year)

// Defining the list of useful bands
var selectedBands = ['classification_1985', 'classification_1986', 'classification_1987', 
                     'classification_1988', 'classification_1989', 'classification_1990', 
                     'classification_1991', 'classification_1992', 'classification_1993', 
                     'classification_1994', 'classification_1995', 'classification_1996', 
                     'classification_1997', 'classification_1998', 'classification_1999', 
                     'classification_2000', 'classification_2001', 'classification_2002', 
                     'classification_2003', 'classification_2004', 'classification_2005', 
                     'classification_2006', 'classification_2007', 'classification_2008', 
                     'classification_2009', 'classification_2010', 'classification_2011', 
                     'classification_2012', 'classification_2013', 'classification_2014', 
                     'classification_2015', 'classification_2016', 'classification_2017', 
                     'classification_2018', 'classification_2019', 'classification_2020', 
                     'classification_2021', 'classification_2022'];

// Function to clip and calculate the mode
var calculateMode = function(band) {
  // Clip the band to the municipality area
  var clippedImage = mapbiomas.select(band).clip(sinop);

  // Calculate the mode for the clipped area
  var mode = clippedImage.reduceRegion({
    reducer: ee.Reducer.mode(),
    geometry: sinop.geometry(),
    scale: 30,
    maxPixels: 1e10
  }).get(band);
  
  // Tranformation to ee.Number and result rounding:
  var roundedMode = ee.Number(mode).round();
  
  return roundedMode;
};

// MAP method to iterate between band and calculate the mode
var modes = selectedBands.map(function(band) {
  var modeValue = calculateMode(band);
  return modeValue;
});

// Saving results as a dictionary
var modeResults = {};
selectedBands.forEach(function(band, index) {
  modeResults[band] = modes[index];
});

// Printing the dict
print('MÉTRICA 1: MODA', modeResults);

// Plot
// Transforming/creating the Feature Collection for plotting
var modeFeatures = ee.FeatureCollection(selectedBands.map(function(band, index) {
  return ee.Feature(null, {
    band: band,
    mode: modes[index]
  });
}));

// Plot
var chart = ui.Chart.feature.byFeature(modeFeatures, 'band', 'mode')
  .setChartType('ColumnChart')
  .setOptions({
    title: 'MODE of Land Classification in Sinop per YEAR',
    hAxis: { title: 'Year' },
    vAxis: { title: 'Class' },
    legend: { position: 'none' },
    colors: ['orange']
  });

// Print
print(chart);

// METRIC 2 - Time evolution of pixel/class count per year

// 2.1 HISTOGRAM: PIXELS - Number of pixels per class for each year/band:

// List of MapBiomas bands for analysis
var bands = mapbiomas.bandNames();

// Function to generate the histogram for a specific band
var generateHistogram = function(band) {
  // Clipping the bands
  var clippedImage = mapbiomas.select(band).clip(sinop);

  // Pixel counting for each class
  var pixelCount = clippedImage.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: sinop.geometry(),
    scale: 30,
    maxPixels: 1e10
  });

  // Generating the histogram
  var histogram = ee.Dictionary(pixelCount.get(band));

  // Converting the histogram into a FeatureCollection for plotting
  var histogramFeatureCollection = ee.FeatureCollection(histogram.keys().map(function(classValue) {
    return ee.Feature(null, {
      class: ee.Number.parse(classValue),
      count: histogram.get(classValue)
    });
  }));

  // Creating the histogram
  var chart = ui.Chart.feature.byFeature(histogramFeatureCollection, 'class', 'count')
    .setChartType('ColumnChart')
    .setOptions({
      title: 'Histograma de Classes - Sinop (' + band + ')',
      hAxis: { title: 'Classe' },
      vAxis: { title: 'Contagem de Pixels' },
      legend: { position: 'none' },
      colors: ['orange']
    });

  // Printing
  print(chart);
};

// Iterating over each band to generate the histogram
bands.evaluate(function(bandList) {
  bandList.forEach(function(band) {
    generateHistogram(band);
  });
});

// 2.2 HISTOGRAM: AREA - Calculation of the area occupied by each class, for each year/band.

// Function to calculate the area occupied by each class in hectares
var calculateAreaInHectares = function(band) {
  // Selecting and clipping the band
  var clippedImage = mapbiomas.select(band).clip(sinop);

  // Counting the pixels of each class
  var pixelCount = clippedImage.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: sinop.geometry(),
    scale: 30,
    maxPixels: 1e10
  });

  // Generating the histogram
  var histogram = ee.Dictionary(pixelCount.get(band));

  // Converting the histogram into a FeatureCollection for plotting
  var areaFeatureCollection = ee.FeatureCollection(histogram.keys().map(function(classValue) {
    var count = ee.Number(histogram.get(classValue));
    var areaHa = count.multiply(30 * 30).divide(10000); // Cada pixel = 30m x 30m, convertendo para hectares
    return ee.Feature(null, {
      class: ee.Number.parse(classValue),
      areaHa: areaHa
    });
  }));

  // Creating the barplots (class)
  var chart = ui.Chart.feature.byFeature(areaFeatureCollection, 'class', 'areaHa')
    .setChartType('ColumnChart')
    .setOptions({
      title: 'Área Ocupada por Classe (ha) - Sinop (' + band + ')',
      hAxis: { title: 'Classe' },
      vAxis: { title: 'Área (ha)' },
      legend: { position: 'none' },
      colors: ['olive']
    });

  // Print
  print(chart);
};

// Iterating over each band for area calculation
bands.evaluate(function(bandList) {
  bandList.forEach(function(band) {
    calculateAreaInHectares(band);
  });
});

// METRIC 3 - Usage frequencies (aggregated via reducer)

// List of classes of interest and codes (Collection 8)
var classes = [
  {name: 'Pastagem', code: 15},
  {name: 'Soja', code: 39},
  {name: 'Cana', code: 20},
  {name: 'Arroz', code: 40},
  {name: 'Algodão', code: 62},
  {name: 'Outras Temp', code: 41},
  {name: 'Café', code: 46},
  {name: 'Citrus', code: 37},
  {name: 'Dendê', code: 35},
  {name: 'Outras Perenes', code: 48},
  {name: 'Silvicultura', code: 9},
  {name: 'Mosaico de Usos', code: 21}
];

// Function to calculate the frequency of a class
var calculateFrequency = function(classe) {
  var mask = mapbiomas.eq(classe.code).clip(sinop); // Create the class mask
  var frequency = mask.reduce(ee.Reducer.sum()); // Calculate the class frequency
  return {name: classe.name, frequency: frequency};
};

// Apply the function to all classes
var results = classes.map(calculateFrequency);

// Visualization parameters
var visParams = {
  min: 0,
  max: 37,
  palette: ['white', 'orange', 'red']
};

// Dynamically add layers to the map
results.forEach(function(result) {
  Map.addLayer(result.frequency, visParams, result.name + ' com redutor');
});

// View the original 2022 map for comparison
var vis = {
  bands: ['classification_2022'],
  min: 0,
  max: 62,
  palette: paletteMapBiomas
};

Map.addLayer(mapbiomas.clip(sinop), vis, 'Mapa 2022');
