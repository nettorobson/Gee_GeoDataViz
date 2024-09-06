/*
PROJETO
Análise da serie histórica de uso agropecuário e florestal do município de Sinop/MT, a partir da coleção 8 do projeto MapBiomas (1985 - 2022).

OBJETIVOS
Obtenção e análise das seguintes métricas:
  
  MÉTRICA 1 - MODA
Destacar a evolução do principal uso Agropecuário/Florestal durante a série histórica.
  
  MÉTRICA 2.1 - HISTOGRAMA: PIXELS
Gerar histograma e .csv dos dados por classe e por ano para a métrica: pixels 
  
  MÉTRICA 2.2 - HISTOGRAMA: ÁREA
Gerar histograma e .csv dos dados por classe e por ano para a métrica: área(ha)
  
  MÉTRICA 3 - FREQUÊNCIA
Avaliar a intensidade de uso para cada classe de uso agropecuário/florestal durante o período.


CONCLUSÕES PRELIMINARES
  MÉTRICA 1 - MODA
Até o ano de 2008, a classe predominante no município de Sinop(MT) foi 'Formaçao florestal'.
A partir de 2009, a classe 'Soja' ganbou maior relevância, indicando a tendência de conversão do uso do solo no município,

  MÉTRICA 2.1 - HISTOGRAMA: PIXELS
A série histórica de histogramas indica a redução gradual da classe 'Formação florestal', com a redução da velocidade de conversão a partir de 2012. 
Entre 1985 e 2003, A classe que ganhava terreno e relevância em detrimento da 'Formação florestal' foi 'Pastagem'.
A partir de 2004 o cenário mudou, e foi a classe 'Soja' que teve um crescimento destacado em detrimento da 'Formação florestal' e da 'Pastagem'.

  MÉTRICA 2.2 - HISTOGRAMA: ÁREA
Traz as mesmas conclusões da métrica anterior, mas sob a ótica da área ocupada (em hectares). 
O cálculo nesta unidade de área é mais adequado para o cálculo de estimativas econômicas e projeções/predições de usos futuros.

  MÉTRICA 3 - FREQUÊNCIA
No acumulado da série histórica, destaca-se que:
Em termos de ´área ocupada, a 'Soja' tem sido destacadamente a principal atividade agropecuária do município, com exceção da região noroeste do território, onde predominam as 'Pastagens'.
A soja ocupa 169 mil hectares em 2022, em comparação com os 403 hectares do ano de 1985.
A silvicultura ´é pouco representativa dentro do contexto do município. (429 ha para o ano de 2022)
'Outras Lavouras Perenes' estão visualmente distribuídas homogeneamente pelo território do município.
A área ocupada por 'Formação Florestal' reduziu em 58% durante o período, ocupando atualmente 148 mil hectares.  


PRÓXIMAS ETAPAS
Cálculo de métricas complementares, derivadas desta análise/exploração inicial;
Refinamento dos gráficos;
Criação de histogramas dinâmicos/animados indicando a evolução anual das classes;
Aplicação de algumas camadas de refatoração;
Testes finais;
Revisar e refinar documentação;
Export dos dados e dos produtos entregáveis;
*/

// ETAPA 1 - RECURSOS INICIAIS E ÁREA DE INTERESSE

// Importando a Coleção 8 do MapBiomas
var mapbiomas = ee.Image('projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1');

// Módulo com a paleta de cores do MapBiomas 8
var palettes = require('users/mapbiomas/modules:Palettes.js');
var paletteMapBiomas = palettes.get('classification8');

// Criação da geometria do polígono (escolhi um município para aplicar o teste)
var sinop = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/municipios-2016')
    .filter(ee.Filter.eq('NM_MUNICIP','SINOP'))

// Centraliza o mapa na geometria e adiciona a geometria ao mapa
Map.centerObject(sinop, 8);
Map.addLayer(sinop, {color: 'red'}, 'Sinop');

///////////////////////////////////////////////////////////////////

// ETAPA 2 - CÁLCULO E VISUALIZAÇÃO DE MÉTRICAS

// MÉTRICA 1 - Moda (Classe com maior frequência de ocorrência por ano)

// Definindo a lista de bandas de interesse 
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

// Função para clipar e calcular a moda
var calculateMode = function(band) {
  // Clipar a banda para a área do município
  var clippedImage = mapbiomas.select(band).clip(sinop);

  // Calcular a moda para a área clipada
  var mode = clippedImage.reduceRegion({
    reducer: ee.Reducer.mode(),
    geometry: sinop.geometry(),
    scale: 30,
    maxPixels: 1e10
  }).get(band);
  
  // Transformação para ee.Number e arredondamento do resultado:
  var roundedMode = ee.Number(mode).round();
  
  return roundedMode;
};

// Método Map para iterar as bandas e calcular a moda
var modes = selectedBands.map(function(band) {
  var modeValue = calculateMode(band);
  return modeValue;
});

// Salvando os resultados em um Dicionário
var modeResults = {};
selectedBands.forEach(function(band, index) {
  modeResults[band] = modes[index];
});

// Printando o dicionário de modas
print('MÉTRICA 1: MODA', modeResults);

// Plotagem
// Transformação/criação da Feature Collection para plotagem
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

// MÉTRICA 2 - Evolução da contagem de pixels/classes por ano

// 2.1 HISTOGRAMA: PIXELS - Quantidade de pixels por classe para cada ano/banda:

// Lista de bandas do MapBiomas para análise
var bands = mapbiomas.bandNames();

// Função para gerar o histograma para uma banda específica
var generateHistogram = function(band) {
  // Selecionando e clipando a banda
  var clippedImage = mapbiomas.select(band).clip(sinop);

  // Contando os pixels de cada classe
  var pixelCount = clippedImage.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: sinop.geometry(),
    scale: 30,
    maxPixels: 1e10
  });

  // Obtendo o histograma
  var histogram = ee.Dictionary(pixelCount.get(band));

  // Convertendo o histograma em uma FeatureCollection para plotagem
  var histogramFeatureCollection = ee.FeatureCollection(histogram.keys().map(function(classValue) {
    return ee.Feature(null, {
      class: ee.Number.parse(classValue),
      count: histogram.get(classValue)
    });
  }));

  // Criando o gráfico de histograma
  var chart = ui.Chart.feature.byFeature(histogramFeatureCollection, 'class', 'count')
    .setChartType('ColumnChart')
    .setOptions({
      title: 'Histograma de Classes - Sinop (' + band + ')',
      hAxis: { title: 'Classe' },
      vAxis: { title: 'Contagem de Pixels' },
      legend: { position: 'none' },
      colors: ['orange']
    });

  // Exibindo o gráfico no console
  print(chart);
};

// Iterando sobre cada banda para gerar o histograma
bands.evaluate(function(bandList) {
  bandList.forEach(function(band) {
    generateHistogram(band);
  });
});

// 2.2 HISTOGRAMA: ÁREA - Cálculo da área ocupada por classe, e para cada ano/banda.

// Função para calcular a área ocupada por cada classe em hectares
var calculateAreaInHectares = function(band) {
  // Selecionando e clipando a banda
  var clippedImage = mapbiomas.select(band).clip(sinop);

  // Contando os pixels de cada classe
  var pixelCount = clippedImage.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: sinop.geometry(),
    scale: 30,
    maxPixels: 1e10
  });

  // Obtendo o histograma
  var histogram = ee.Dictionary(pixelCount.get(band));

  // Convertendo o histograma em uma FeatureCollection para calcular áreas
  var areaFeatureCollection = ee.FeatureCollection(histogram.keys().map(function(classValue) {
    var count = ee.Number(histogram.get(classValue));
    var areaHa = count.multiply(30 * 30).divide(10000); // Cada pixel = 30m x 30m, convertendo para hectares
    return ee.Feature(null, {
      class: ee.Number.parse(classValue),
      areaHa: areaHa
    });
  }));

  // Criando o gráfico de área por classe
  var chart = ui.Chart.feature.byFeature(areaFeatureCollection, 'class', 'areaHa')
    .setChartType('ColumnChart')
    .setOptions({
      title: 'Área Ocupada por Classe (ha) - Sinop (' + band + ')',
      hAxis: { title: 'Classe' },
      vAxis: { title: 'Área (ha)' },
      legend: { position: 'none' },
      colors: ['olive']
    });

  // Exibindo o gráfico no console
  print(chart);
};

// Iterando sobre cada banda para calcular a área
bands.evaluate(function(bandList) {
  bandList.forEach(function(band) {
    calculateAreaInHectares(band);
  });
});

// MÉTRICA 3 - Frequências de uso (agregados via redutor)

// Lista das classes de interesse e códigos (coleção 8)
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

// Função para calculo da frequência de uma classe
var calculateFrequency = function(classe) {
  var mask = mapbiomas.eq(classe.code).clip(sinop); // Cria a máscara da classe
  var frequency = mask.reduce(ee.Reducer.sum()); // Calcula a frequência da classe
  return {name: classe.name, frequency: frequency};
};

// Aplicar a função para todas as classes
var results = classes.map(calculateFrequency);

// Parâmetros de visualização
var visParams = {
  min: 0,
  max: 37,
  palette: ['white', 'orange', 'red']
};

// Adicionar camadas ao mapa dinamicamente
results.forEach(function(result) {
  Map.addLayer(result.frequency, visParams, result.name + ' com redutor');
});

// Visualizar o mapa original de 2022 para comparação
var vis = {
  bands: ['classification_2022'],
  min: 0,
  max: 62,
  palette: paletteMapBiomas
};

Map.addLayer(mapbiomas.clip(sinop), vis, 'Mapa 2022');
