var channelList;
var _channelList;
var _streamList = [];
var selectedCategory;
var selectedCountry;

window.addEventListener('DOMContentLoaded', async () => {
    console.debug("Reading channels.");
    $("#loading-spinner").toggleClass("loading");
    let channels = await window.remote.getChannels();
    //let channels = mockChannels();
    console.debug(channels);

    console.log("Found " + channels.length + " channel(s).");

    // Filter closed channels
    channels = channels.filter(channel => !channel.closed && !channel.replaced_by);

    console.log("Filter closed/replaced channels, remaining: " + channels.length);

    // Read blocklist to filter out blocked channels
    let blocklist = await window.remote.getBlockList();
    if (blocklist && blocklist.length > 0) {
        blocklist = blocklist.map(i => i.channel);
        channels = channels.filter(channel => !blocklist.includes(channel.id));
    }

    console.log("Filter blocked channels, remaining: " + channels.length);

    // No longer needed
    blocklist = undefined;

    let streams = await window.remote.getStreams();
    if (streams && streams.length > 0) {
        streams = streams.filter(stream => !stream.http_referrer && !stream.user_agent);
        const streamMap = streams.map(i => i.channel);
        channels = channels.filter(channel => streamMap.includes(channel.id));
        _streamList = streams;
    }

    console.log("Filter channels without a stream, remaining: " + channels.length);

    // Read extra filters
    const categories = await window.remote.getCategories();
    $.each(categories, (i, item) => {
        $('#categories').append($('<option>', { value: item.id, text: item.name }));
    })
    const countries = await window.remote.getCountries();
    $.each(countries, (i, item) => {
        $('#countries').append($('<option>', { value: item.code, text: (item.flag + ' ' + item.name )}))
    });

    channels.forEach(channel => {
        if(!isPropertyValid(channel.network) && isPropertyValid(channel.owners)) {
            channel.network = channel.owners.join(', ')
        } else {
            channel.network = channel.id
        }
        channel.categories = channel.categories.join(', ');
    });

    _channelList = channels;

    if(_channelList.length > 0) {
        refreshChannels(_channelList);
    };

    $("#loading-spinner").toggleClass("loading");
});

function refreshChannels(_channelList) {
    channelList = _channelList.splice(0, 25);
    $('#list-channel')
        .html([...channelList]
            .map(channelPanel)
            .join('')
        )
}

$('#video-view').on('shown.bs.modal', (event) => {
    if(event?.relatedTarget?.dataset?.tvId) {
        const id = event.relatedTarget.dataset.tvId;
        if(_streamList?.length > 0) {
            let stream = _streamList.find(i => i.channel == id);
            if(stream) {
                console.log('Stream found for ' + id + ':', stream);
                $('#video-player').html(videoPlayer);
                $("#video-src").attr('src', stream.url);
                videojs(document.querySelector('.video-js'));
            }
        }
    } else {
        console.error('Failed to read channel id', event);
    }
});

$('#video-view').on('hidden.bs.modal', () => {
    const video = videojs(document.querySelector('.video-js'));
    video.dispose();
})

$('#categories').on('change', (event) => {
    const val = $('#categories').find(":selected").val();
    if(val != selectedCategory) {
        $('#list-channel').empty();
    }
    if(val == '-') {
        let refreshList = _channelList;
        if(selectedCountry) {
            refreshList = refreshList.filter(i => selectedCountry == i.country);
        }
        refreshChannels(refreshList);
    } else {
        let filteredList = _channelList.filter(i => i.categories.includes(val));
        if(selectedCountry) {
            filteredList = filteredList.filter(i => selectedCountry == i.country);
        }
        refreshChannels(filteredList);
    }
    selectedCategory = val != '-' ? val : null;
}); 

$('#countries').change(() => {
    const val = $('#countries').find(":selected").val()
    if(val != selectedCountry) {
        $('#list-channel').empty();
    }
    if(val == '-') {
        let refreshList = _channelList;
        if(selectedCategory) {
            refreshList = refreshList.filter(i => i.categories.includes(selectedCategory));
        }
        refreshChannels(refreshList);
    } else {
        let filteredList = _channelList.filter(i => val == i.country);
        if(selectedCategory) {
            filteredList = filteredList.filter(i => i.categories.includes(selectedCategory));
        }
        refreshChannels(filteredList);
    }
    selectedCountry = val != '-' ? val : null;
})


const isPropertyValid = (property) => {
    return property && property.length > 0;
}

const videoPlayer = () => `              <video 
              class="video-js"
              controls
              width="640"
              height="264">
              <source src="" type="application/x-mpegURL" id="video-src">
            </video>`

const channelPanel = ({name, categories, country, network, logo, id}) => `<div class="channel-panel mt-3" data-bs-toggle="modal" data-bs-target="#video-view" data-tv-id="${id}">
          <div class="row">
            <div class="col-1 me-5">
              <img src="${logo}">
            </div>
            <div class="col">
              <div class="row">
                <span class="fw-bold">${name} - ${country} (${network})</span>
                <span class="fst-italic">${categories}</span>
              </div>
            </div>
          </div>
        </div>`;