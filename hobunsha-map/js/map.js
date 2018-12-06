function drawMap(GeoJSON) {

    var center = [36, 136];

    //GeoJSONの分割する際のパラメーター
    const tileOptions = {
        maxZoom: 20,
        tolerance: 5,
        extent: 4096,
        buffer: 64,
        debug: 0,
        indexMaxZoom: 0,
        indexMaxPoints: 100000
    };

    //GeoJSONデータをタイル座標ごとに分割する
    var tileIndex = geojsonvt(GeoJSON, tileOptions);

    //leafetに追加するカスタムグリッドレイヤーのオブジェクトを生成
    var grid = L.gridLayer();
    var addCityTile = addCanvasTile(tileIndex);

    grid.createTile = function(coords, done) {
        var canvas = addCityTile(coords, done);
        return canvas;
    };

    // Define some base layers
    var basic = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/basic-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGlyb3NhamkiLCJhIjoiY2phYW1qM2lyMHRzcTMybzd1dzhlaG83NCJ9.2QcsoUxneas4TQFI3F-DyQ',
            {id: 'basic', attribution: '© Mapbox contributors'}),
        light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGlyb3NhamkiLCJhIjoiY2phYW1qM2lyMHRzcTMybzd1dzhlaG83NCJ9.2QcsoUxneas4TQFI3F-DyQ',
            {id: 'light', attribution: '© Mapbox contributors'}),
        satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGlyb3NhamkiLCJhIjoiY2phYW1qM2lyMHRzcTMybzd1dzhlaG83NCJ9.2QcsoUxneas4TQFI3F-DyQ',
            {id: 'satellite', attribution: '© Mapbox contributors'}),
        MIERUNE_basic = L.tileLayer('https://tile.mierune.co.jp/mierune/{z}/{x}/{y}.png',
            {id: 'light', attribution: "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL."}),
        MIERUNE_mono = L.tileLayer('https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png',
            {id: 'light', attribution: "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL."}),
        osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {id: 'osm', attribution: '© OpenStreetMap contributors'}
        );
    // The tree containing the layers
    var layerTree = [
        {
            label: 'Mapbox',
            children: [
                {label: 'Basic', layer: basic, name: 'Basic'},
                {label: 'Light', layer: light, name: 'Light'},
                {label: 'Satellite', layer: satellite, name: 'Satellite'},
            ]
        },
        {
            label: 'MIERUNE',
            children: [
                {label: 'MIERUNE_basic', layer: MIERUNE_basic, name: 'MIERUNE_basic'},
                {label: 'MIERUNE_mono', layer: MIERUNE_mono, name: 'MIERUNE_mono'},
            ]
        },
        {
            label: 'OpenStreeMap',
            children: [
                {label: 'OpenStreeMap', layer: osm, name: 'OpenStreeMap'},
            ]
        },
        {
            label: 'gridTile',
            children: [
                {label: 'prefTile', layer: grid, name: 'prefTile'},
            ]
        },
    ];
    // The map
    var map = L.map('map', {
        layers: [basic],
        center: center,
        zoom: 5
    });      
    map.zoomControl.setPosition("bottomright");

    L.control.layers.tree(layerTree).addTo(map);

    var assetLayerGroup = new L.LayerGroup();

    var animeDetailWindow = d3.select(".anime-detail-window");
    var animeDetailWindowTitle = d3.select(".anime-detail-window__title");
    var animeDetailWindowWrap = d3.select(".anime-detail-window__wrap");

    var buttonIcon = d3.select(".button__icon");
    var buttonIconClose = d3.select(".button--close.anime-detail-window__button");

    // functions
    function setMarkers(selectTitleData) {
        
        assetLayerGroup.clearLayers();

        if(selectTitleData[0].place) {
        
            selectTitleData.forEach(d => {
                var marker = L.marker([d.lat, d.lng], {
                    place: d.place,
                    animeTitle: d.title,
                    bounceOnAdd: true,
                    bounceOnAddOptions: {duration: 500, height: 100},
                    // bounceOnAddCallback: function() { console.log(d.place); }
                }).on("click", function() {
                    var clickedPlace = d3.select(this).nodes()[0].options.place;
                    var selectTitle = d3.select(this).nodes()[0].options.animeTitle;
                    updateAnimeDetailWindow(clickedPlace, selectTitle);
                });
                assetLayerGroup.addLayer(marker);
            })
            
            map.addLayer(assetLayerGroup);
        }
    }

    var clickedOnWindow = false;

    function updateAnimeDetailWindow(place, title) {
        // Detect click on detail-window
        animeDetailWindow.on("click", function(){ clickedOnWindow = true; });

        if(!animeDetailWindow.classed("__open")) animeDetailWindow.classed("__open", true);
        animeDetailWindowTitle.html(place);
        animeDetailWindowWrap.html("<img class='anime-detail-window__img' src='img/scene/" + title + "/" + place + ".jpg'>");

        d3.select("#map").on("click", function() {
            if(animeDetailWindow.classed("__open") && clickedOnWindow) animeDetailWindow.classed("__open", false);
            clickedOnWindow = false;
        });
    };

    // button--close mouseover event
    buttonIcon.on("mouseover", function(){ buttonIconClose.classed("__touchstart", true); });
    buttonIcon.on("mouseout", function(){ buttonIconClose.classed("__touchstart", false); });
}