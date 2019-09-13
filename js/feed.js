(function(window, document) {
    "use strict"; // Localize jQuery variables
    var app_url = getDsmAppUrl();

    // loading animation
    var el = document.getElementsByClassName('sk-ww-instagram-hashtag-feed')[0];

    if (el == undefined) {
        var el = document.getElementsByClassName('dsm-ww-instagram-hashtag-feed')[0];
        el.className = "sk-ww-instagram-hashtag-feed";
    }

    el.innerHTML = "<div class='first_loading_animation' style='text-align:center; width:100%;'><img src='" + app_url + "images/ripple.svg' class='loading-img' style='width:auto !important;' /></div>";
    // load css
    loadCssFile(app_url + "embed/instagram-hashtag-feed/libs/js/magnific-popup/magnific-popup.css");
    loadCssFile(app_url + "embed/instagram-hashtag-feed/widget_css.php");
    loadCssFile("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
    loadCssFile(app_url + "libs/js/swiper/swiper.min.css");
    loadCssFile(app_url + "libs/js/swiper/swiper.css?v=ranndomchars");

    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function() { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            };
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        scriptLoadHandler();
    }

    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {

        loadScript(app_url + "embed/instagram-hashtag-feed/libs/js/magnific-popup/jquery.magnific-popup.min.js", function() {
            loadScript(app_url + "embed/libs/js/custom.js", function() {

                // Restore $ and window.jQuery to their previous values and store the new jQuery in our local jQuery variable
                $ = jQuery = window.jQuery.noConflict(true);

                loadScript(app_url + "libs/js/swiper/swiper.min.js", function() {
                    main();
                });

            });
        });
    } // load css file
    function loadCssFile(filename) {

        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);

        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref)
        }
    }


    function loadScript(url, callback) {

        /* Load script from url and calls callback once it's loaded */
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", url);

        if (typeof callback !== "undefined") {
            if (scriptTag.readyState) {
                /* For old versions of IE */
                scriptTag.onreadystatechange = function() {
                    if (this.readyState === 'complete' || this.readyState === 'loaded') {
                        callback();
                    }
                };
            } else {
                scriptTag.onload = callback;
            }
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
    }


    function getDsmAppUrl() {

        // auto detect live and dev version
        var scripts = document.getElementsByTagName("script");
        var scripts_length = scripts.length;
        var search_result = -1;
        var app_url = "";

        for (var i = 0; i < scripts_length; i++) {
            var src_str = scripts[i].getAttribute('src');

            if (src_str != null) {
                search_result = src_str.search("embed/instagram-hashtag-feed/widget");

                // app-dev found if greater than or equal to 1
                if (search_result >= 1) {
                    var src_arr = src_str.split("embed/instagram-hashtag-feed/widget");
                    app_url = src_arr[0];

                    // replace if displaysocialmedia.com
                    app_url = app_url.replace("displaysocialmedia.com", "sociablekit.com");
                }
            }
        }

        return app_url;
    }

    function getDsmEmbedId(sk_instagram_feed) {
        var embed_id = sk_instagram_feed.attr('embed-id');
        if (embed_id == undefined) { embed_id = sk_instagram_feed.attr('data-embed-id'); }
        return embed_id;
    }

    function getDsmSetting(sk_instagram_feed, key) {
        return sk_instagram_feed.find("." + key).text();
    }

    function hidePopUp() {
        jQuery.magnificPopup.close();
    }


    function skIgFeedSetThumbnails(data) {
        // set thumbnail
        // jQuery.each(data.posts, function(key, val){
        //     if(val.api==2 && (val.type=="video" || val.type=="carousel" || val.type=="carousel_album")){
        //         var json_url=app_url + "embed/instagram-hashtag-feed/widget_read_one_json.php?code=" + val.code;
        //         jQuery.getJSON(json_url, function(data){
        //             var thumbnail_img = data.photo_link;
        //             jQuery("#sk_ig_ht_feed_post_" + val.id).css({
        //                 "background-image" : "url(" + thumbnail_img + ")"
        //             });
        //             console.log(thumbnail_img);
        //         });
        //     }
        // });
    }


    function syncDateTimePosted() {

        // loop through each item
        jQuery(".date_time_posted_span").each(function() {
            var code = jQuery(this).attr('data-code');
            var date_time_posted_span = jQuery(this).text();

            if (date_time_posted_span == "0000-00-00 00:00:00") {
                jQuery(this).load(app_url + "sync/sync_instagram_post_date_time.php?code=" + code, function() {
                    // console.log(code);
                });
            }
        });
    }


    function getFreshPopUpContent(post) {

        // try to get json via js
        jQuery.getJSON("https://www.instagram.com/p/" + post.code + "/?__a=1", function(ig_post_json) {

            var code = post.code;
            var feed_item_container = jQuery('.sk-media-post-container-' + post.id);
            var read_one_url = app_url + "embed/instagram-hashtag-feed/widget_read_one_json.php?code=" + code;

            jQuery.post(read_one_url, { json_feed: ig_post_json }, function(one_data, textStatus) {

                var post_items = "";
                if (one_data.type == "video") {
                    post_items += "<video class='ig_media' controls>";
                    post_items += "<source src='" + one_data.video_url + "' type='video/mp4'>";
                    post_items += "Your browser does not support the video tag.";
                    post_items += "</video>";
                    jQuery('.sk-media-post-container-' + post.id).find('.sk_loading_video').html(post_items);
                }
                if (one_data.type == "carousel") {
                    one_data.carousel_items.forEach(function(element) {
                        if (element.includes('mp4')) {
                            post_items += "<div class='swiper-slide'><video class='carousel-video' src='" + element + "'  controls></video></div>";
                        } else {
                            post_items += "<div class='swiper-slide'><img src='" + element + "' class='ig_media'/></div>";
                        }
                    });
                    jQuery('.sk-media-post-container-' + post.id).find('.sk_loading_carousel').html(post_items);
                }
                if (one_data.type == 'image') {
                    post_items += "<img src='" + one_data.photo_link + "' class='ig_media' alt=\"" + one_data.description + "\" title=\"" + one_data.description + "\">";
                    feed_item_container.find('.sk_loading_image').html(post_items);
                }

                if (jQuery('.mfp-content .sk-pop-ig-post video').get(0) !== undefined) {
                    jQuery('.mfp-content .sk-pop-ig-post video').get(0).play();
                }
            })

            .fail(function(xhr, status, error) {
                // error handling
                console.log(xhr.responseText);
            });;

        });

    }

    function loadInstagramFeedForSliderLayout(jQuery, sk_instagram_feed) {

        var embed_id = getDsmEmbedId(sk_instagram_feed);
        var json_url = app_url + "embed/instagram-hashtag-feed/widget_feed_json.php?embed_id=" + embed_id;
        var instagram_tag = sk_instagram_feed.find('.instagram_tag').text();
        var hashtag_text = sk_instagram_feed.find('.hashtag_text').text();

        // get events
        jQuery.getJSON(json_url, function(data) {


            var has_next_data = data.page_info.next_page_url;

            if (data.message == 'load failed') {

                var sk_error_message = "";
                sk_error_message += "<ul class='sk_error_message'>";
                sk_error_message += "<li>Unable to load Instagram hashtag feed.</li>";
                sk_error_message += "<li>Make sure a post with <a href='https://www.instagram.com/explore/tags/" + instagram_tag + "/' target='_blank'>#" + instagram_tag + "</a> exists.</li>";
                sk_error_message += "<li>Make sure a post with <a href='https://www.instagram.com/explore/tags/" + instagram_tag + "/' target='_blank'>#" + instagram_tag + "</a> is public.</li>";
                sk_error_message += "<li>If you need help, <a href='https://www.sociablekit.com/support' target='_blank'>contact support here</a>.</li>";
                sk_error_message += "</ul>";

                sk_instagram_feed.find(".first_loading_animation").hide();
                sk_instagram_feed.append(sk_error_message);

            } else {

                var post_items = "";

                if (sk_instagram_feed.find('.show_hashtag_text').text() == 1) {
                    post_items += "<div class='sk-ig-profile-usename'>";
                    post_items += "<a href='https://www.instagram.com/explore/tags/" + hashtag_text + "' target='_blank'>";
                    post_items += hashtag_text;
                    post_items += "</a>";
                    post_items += "</div>";
                }

                post_items += "<div id='sk_instagram_feed_slider' class='swiper-container swiper-layout-slider'>";
                post_items += "<div class='swiper-wrapper'>";
                post_items += "<div class='swiper-slide' >";
                post_items += "<div class='sk-ig-all-posts'>";
                jQuery.each(data.posts, function(key, val) {
                    post_items += getFeedItem(val, sk_instagram_feed);
                    getFreshPopUpContent(val);

                });

                post_items += "</div>";
                post_items += "</div>";
                //for autoplay 
                if (data.page_info.next_page_url != "" && getDsmSetting(sk_instagram_feed, "autoplay") == 1) {
                    for (var i = 2; i <= data.page_info.pages; i++) {
                        var base_url = data.page_info.base_url + i;
                        post_items += "<div class='swiper-slide'>";
                        post_items += "<div class='sk-ig-all-posts slide-page-" + i + "'>";
                        getAutoplaySlider(sk_instagram_feed, base_url);
                        post_items += "</div>";
                        post_items += "</div>";
                    }
                }
                post_items += "</div>";
                post_items += "<button type='button' class='swiper-button-next ' style='pointer-events: all;'>";
                post_items += "<i class='fa fa-chevron-circle-right swiper-next-arrow' aria-hidden='true'></i>";
                post_items += "</button>";
                post_items += "<button type='button' class='swiper-button-next-trigger display-none' style='pointer-events: all;'>";
                post_items += "<i class='fa fa-chevron-circle-right swiper-next-arrow' aria-hidden='true'></i>";
                post_items += "</button>";
                post_items += "<button type='button' class='swiper-button-prev' style='pointer-events: all;'>";
                post_items += "<i class='fa fa-chevron-circle-left swiper-prev-arrow' aria-hidden='true'></i>";
                post_items += "</button>";
                post_items += "</div>";
                post_items += "<div class='sk-ig-next-page display-none'>" + data.page_info.next_page_url + "</div>";
                sk_instagram_feed.append(post_items);


                syncDateTimePosted();
                applyCustomUi(jQuery, sk_instagram_feed);
                if (getDsmSetting(sk_instagram_feed, "autoplay") == 0) {
                    skLayoutSliderSetting(sk_instagram_feed);
                }
                jQuery.each(data.posts, function(key, val) {
                    replaceContentWithLinks(jQuery(".sk-ig-text-" + val.id));
                });

            }
        });

    }

    function getAutoplaySlider(sk_instagram_feed, base_url) {
        var count_swiper = sk_instagram_feed.find('.swiper-slide-active').length;
        var json_url = base_url;
        jQuery.getJSON(json_url, function(data) {
            var html_item = "";
            jQuery.each(data.posts, function(key, val) {
                html_item += getFeedItem(val, sk_instagram_feed);
                getFreshPopUpContent(val);
            });
            sk_instagram_feed.find('.slide-page-' + data.page_info.current_page).html(html_item);
            applyCustomUi(jQuery, sk_instagram_feed);



            if (count_swiper == 0) {
                skLayoutSliderSetting(sk_instagram_feed);
            }
        });
    }



    function skLayoutSliderSetting(sk_instagram_feed) {
        if (getDsmSetting(sk_instagram_feed, "autoplay") == 1) {
            let delay = getDsmSetting(sk_instagram_feed, "delay") * 1000;
            var swiper = new Swiper('.swiper-layout-slider.swiper-container', {
                loop: true,
                autoplay: {
                    delay: delay,
                },
                navigation: {
                    nextEl: '.swiper-button-next-trigger',
                    prevEl: '.swiper-button-prev',
                },

            });
        } else {
            var swiper = new Swiper('.swiper-layout-slider.swiper-container', {
                navigation: {
                    nextEl: '.swiper-button-next-trigger',
                    prevEl: '.swiper-button-prev',
                },

            });
        }


        sk_instagram_feed.find('.swiper-button-next').click({ swiper: swiper, sk_instagram_feed: sk_instagram_feed }, skSliderLayoutNextClickEvent);
        sk_instagram_feed.find('.swiper-button-prev').click({ swiper: swiper, sk_instagram_feed: sk_instagram_feed }, skSliderLayoutPrevClickEvent);
    }

    function skSliderLayoutPrevClickEvent(event) {
        clickEventSlider(event.data.sk_instagram_feed);
        event.data.sk_instagram_feed.find('.swiper-button-next').html("<i class='fa fa-chevron-circle-right swiper-next-arrow' aria-hidden='true'></i>");
    }

    function clickEventSlider(sk_instagram_feed) {
        var clicker = sk_instagram_feed.find('.swiper-button-next-trigger');
        var next_page = sk_instagram_feed.find('.sk-ig-next-page').text();
        var next_slide = sk_instagram_feed.find('.swiper-slide-next').text();
        if (next_page == "" && next_slide == "") {
            sk_instagram_feed.find('.swiper-layout-slider .swiper-button-next').css('visibility', 'hidden')
        } else {
            sk_instagram_feed.find('.swiper-layout-slider .swiper-button-next').css('visibility', 'visible')
        }
        skLayoutSliderArrowUI(sk_instagram_feed);
    }

    function skSliderLayoutNextClickEvent(event) {
        var sk_instagram_feed = event.data.sk_instagram_feed;
        var swiper = event.data.swiper;
        var embed_id = getDsmEmbedId(sk_instagram_feed);
        var next_page = sk_instagram_feed.find('.sk-ig-next-page').text();

        var json_url = next_page;

        var next_btn = jQuery(this);
        var current_icon = next_btn.html();
        next_btn.html("<i class='fa fa-spinner fa-pulse swiper-button-spinner' aria-hidden='true'></i>");
        var text = sk_instagram_feed.find(".swiper-layout-slider .swiper-slide-next").text();
        if (text == "" && next_page != "") {
            jQuery.getJSON(json_url, function(data) {
                var post_items = "";
                post_items += "<div class='sk-ig-all-posts'>";
                jQuery.each(data.posts, function(key, val) {
                    post_items += getFeedItem(val, sk_instagram_feed);
                    getFreshPopUpContent(val);

                });
                post_items += "</div>";

                event.preventDefault();
                swiper.appendSlide('<div class="swiper-slide swiper-slide-next"></div>');
                sk_instagram_feed.find('.swiper-slide-next').html(post_items);
                next_btn.html(current_icon);

                sk_instagram_feed.find('.sk-ig-next-page').text(data.page_info.next_page_url);
                sk_instagram_feed.find('.swiper-button-next-trigger').removeClass('swiper-button-disabled').removeAttr('aria-disabled');
                sk_instagram_feed.find('.swiper-button-next-trigger').click();
                if (data.page_info.next_page_url == "") {
                    sk_instagram_feed.find('.swiper-layout-slider .swiper-button-next').css('visibility', 'hidden')
                }
                syncDateTimePosted();
                applyCustomUi(jQuery, sk_instagram_feed);

                jQuery.each(data.posts, function(key, val) {
                    replaceContentWithLinks(jQuery(".sk-ig-text-" + val.id));
                });
            });
        } else {
            sk_instagram_feed.find('.swiper-button-next-trigger').click();

            clickEventSlider(sk_instagram_feed);
            next_btn.html(current_icon);

        }
    }

    function skLayoutSliderArrowUI(sk_instagram_feed) {

        var arrow_background_color = getDsmSetting(sk_instagram_feed, "arrow_background_color");
        var arrow_color = getDsmSetting(sk_instagram_feed, "arrow_color");
        var arrow_opacity = getDsmSetting(sk_instagram_feed, "arrow_opacity");

        // Apply Opacity
        jQuery(".swiper-button-next,.swiper-button-prev")
            .mouseover(function() {
                jQuery(this).css({
                    "opacity": "1"
                });

            }).mouseout(function() {
                jQuery(this).css({
                    "opacity": arrow_opacity
                });
            });

        // Get the height

        var feed_h = sk_instagram_feed.find('.swiper-slide-active .sk-ig-all-posts').innerHeight();
        if (feed_h == null) {
            feed_h = sk_instagram_feed.find('.sk-ig-all-posts').innerHeight();
        }


        // Solution for image cutting
        sk_instagram_feed.find(".swiper-wrapper,.swiper-slide").css({
            "height": feed_h + "px"
        });

        sk_instagram_feed.css("width", "100%");

        // position button to center
        var feed_h_2 = feed_h / 2;
        sk_instagram_feed.find(".swiper-button-prev,.swiper-button-next").css({
            "top": feed_h_2 + "px",
            "background-color": arrow_color,
            "opacity": arrow_opacity,
            "color": arrow_background_color
        });



    }





    function loadInstagramFeed(jQuery, sk_instagram_feed) {


        var embed_id = getDsmEmbedId(sk_instagram_feed);
        var json_url = app_url + "embed/instagram-hashtag-feed/widget_feed_json.php?embed_id=" + embed_id;

        // settings
        var show_profile_picture = sk_instagram_feed.find('.show_profile_picture').text();
        var show_profile_username = sk_instagram_feed.find('.show_profile_username').text();
        var show_profile_follow_button = sk_instagram_feed.find('.show_profile_follow_button').text();
        var show_profile_posts_count = sk_instagram_feed.find('.show_profile_posts_count').text();
        var show_profile_follower_count = sk_instagram_feed.find('.show_profile_follower_count').text();
        var show_profile_following_count = sk_instagram_feed.find('.show_profile_following_count').text();
        var show_profile_name = sk_instagram_feed.find('.show_profile_name').text();
        var show_profile_description = sk_instagram_feed.find('.show_profile_description').text();
        var show_profile_website = sk_instagram_feed.find('.show_profile_website').text();

        var show_load_more_button = sk_instagram_feed.find('.show_load_more_button').text();
        var show_bottom_follow_button = sk_instagram_feed.find('.show_bottom_follow_button').text();

        // text settings
        var posts_text = sk_instagram_feed.find('.posts_text').text();
        var followers_text = sk_instagram_feed.find('.followers_text').text();
        var following_text = sk_instagram_feed.find('.following_text').text();
        var follow_text = sk_instagram_feed.find('.follow_text').text();
        var load_more_posts_text = sk_instagram_feed.find('.load_more_posts_text').text();
        var view_on_instagram_text = sk_instagram_feed.find('.view_on_instagram_text').text();
        var show_post_hover = sk_instagram_feed.find('.show_post_hover').text();
        var instagram_tag = sk_instagram_feed.find('.instagram_tag').text();
        var hashtag_text = sk_instagram_feed.find('.hashtag_text').text();
        var post_count = sk_instagram_feed.find('.post_count').text();


        // get events
        jQuery.getJSON(json_url, function(data) {

            if (data.message == 'load failed') {

                var sk_error_message = "";
                sk_error_message += "<ul class='sk_error_message'>";
                sk_error_message += "<li>Unable to load Instagram hashtag feed.</li>";
                sk_error_message += "<li>Make sure a post with <a href='https://www.instagram.com/explore/tags/" + instagram_tag + "/' target='_blank'>#" + instagram_tag + "</a> exists.</li>";
                sk_error_message += "<li>Make sure a post with <a href='https://www.instagram.com/explore/tags/" + instagram_tag + "/' target='_blank'>#" + instagram_tag + "</a> is public.</li>";
                sk_error_message += "<li>If you need help, <a href='https://www.sociablekit.com/support' target='_blank'>contact support here</a>.</li>";
                sk_error_message += "</ul>";

                sk_instagram_feed.find(".first_loading_animation").hide();
                sk_instagram_feed.append(sk_error_message);

            } else {

                var post_items = "";

                if (sk_instagram_feed.find('.show_hashtag_text').text() == 1) {
                    post_items += "<div class='sk-ig-profile-usename'>";
                    post_items += "<a href='https://www.instagram.com/explore/tags/" + hashtag_text.substr(1) + "' target='_blank'>";
                    post_items += hashtag_text;
                    post_items += "</a>";
                    post_items += "</div>";
                }

                post_items += "<div class='sk-ig-all-posts'>";
                var item_counter = 1;



                jQuery.each(data.posts, function(key, val) {

                    val['view_on_instagram_text'] = view_on_instagram_text;
                    val['show_post_hover'] = show_post_hover;
                    val['display_none'] = item_counter > post_count ? 'display-none' : '';

                    post_items += getFeedItem(val, sk_instagram_feed);
                    getFreshPopUpContent(val);
                    item_counter++;
                });

                post_items += "</div>";
                if (data.page_info.next_page_url != "" && show_load_more_button == 1) {
                    post_items += "<div class='sk-ig-bottom-btn-container'>";
                    post_items += "<button type='button' class='sk-ig-load-more-posts'>" + load_more_posts_text + "</button>";
                    post_items += "</div>";
                }

                post_items += "<div class='sk-ig-next-page display-none'>" + data.page_info.next_page_url + "</div>";

                if (getDsmSetting(sk_instagram_feed, "show_sociablekit_branding") == 1) {
                    post_items += getSociableKITBranding(sk_instagram_feed, "Instagram hashtag feed <i class='fa fa-bolt'></i> by SociableKIT", "instagram hashtag feed");
                }
                sk_instagram_feed.append(post_items);

                // skIgFeedSetThumbnails(data);
                syncDateTimePosted();
                applyCustomUi(jQuery, sk_instagram_feed);

                jQuery.each(data.posts, function(key, val) {
                    replaceContentWithLinks(jQuery(".sk-ig-text-" + val.id));
                });
            }
        });

    }

    function getFeedItem(val, sk_instagram_feed) {
        var view_on_instagram_text = sk_instagram_feed.find('.view_on_instagram_text').text();
        val.caption = val.caption.toString().replace('"', '')
        var post_items = "";
        post_items += "<div class='feed_item_container_" + val.code + " sk-ww-instagram-hashtag-feed-item " + val.display_none + "' style='' ";
        post_items += " title=\"" + val.caption + "\" ";
        post_items += " data-code='" + val.code + "' ";
        post_items += " data-type='" + val.type + "' ";
        post_items += ">";

        // show on load
        if (val.show_post_hover == 1) {
            post_items += "<div class='sk-ig-post-hover display-none'>";

            if (val.multi_hashtag == false) {
                post_items += "<span class='m-r-15px'>";
                post_items += "<i class='fa fa-heart' aria-hidden='true'></i> " + val.likes_count;
                post_items += "</span>";
                post_items += "<span>";
                post_items += "<i class='fa fa-comment' aria-hidden='true'></i> " + val.comments_count;
                post_items += "</span>";
            }

            post_items += "</div>";
        }

        if (val.type == "video") {
            post_items += "<div class='sk-play-btn'><i class='fa fa-play-circle' aria-hidden='true'></i></div>";
        } else if (val.type == "carousel" || val.type == "carousel_album") {
            post_items += "<div class='sk-play-btn'><i class='fa fa fa-files-o' aria-hidden='true' style='font-size:20px; line-height:28px;'></i></div>";
        }

        // display thumbnail
        post_items += "<div id='sk_ig_ht_feed_post_" + val.id + "' style='background-image: url(" + val.thumbnail_src + "); background-size:cover; background-position:center center;' class='sk-ig-post-img'></div>";

        // show in pop up
        post_items += "<div class='white-popup mfp-hide sk-pop-ig-post'>";

        post_items += "<div class='sk-media-post-container sk-media-post-container-" + val.id + "'>";

        // show in pop up
        if (val.type == "video") {
            post_items += "<div class='sk_loading_video' data-code='" + val.code + "'>";
            if (val.video_url) {
                post_items += "<video class='ig_media'>";
                post_items += "<source src='" + val.video_url + "' type='video/mp4'>";
                post_items += "Your browser does not support the video tag.";
                post_items += "</video>";
            } else {
                post_items += "<i class='fa fa-spinner fa-pulse fa-4x' aria-hidden='true'></i>";

            }
            post_items += "</div>";
        } else if (val.type == "carousel" || val.type == "carousel_album") {
            post_items += '<div class="swiper-container swiper-container-single">';
            post_items += '<div class="swiper-wrapper sk_loading_carousel">';
            if (val.carousel_items) {
                val.carousel_items.forEach(function(element) {
                    if (element.includes('mp4')) {
                        post_items += "<div class='swiper-slide'><video class='carousel-video' src='" + element + "'  controls></video></div>";
                    } else {
                        post_items += "<div class='swiper-slide'><img src='" + element + "' class='ig_media'/></div>";
                    }
                });
            }



            post_items += '</div>';
            post_items += '<div class="swiper-pagination"></div>';
            post_items += '<div class="swiper-button-next-single"></div>';
            post_items += '<div class="swiper-button-prev-single"></div>';
            post_items += '</div>';

        } else {
            post_items += "<div class='sk_loading_image' data-code='" + val.code + "'>";

            post_items += "<img src='" + val.display_src + "' class='ig_media' alt=\"" + val.caption + "\" title=\"" + val.caption + "\">";
            post_items += "</div>";

        }
        post_items += "</div>";

        post_items += "<div class='post_details' style=\"font-family:" + getDsmSetting(sk_instagram_feed, "font_family") + ";\">";

        if (val.multi_hashtag == false) {
            post_items += "<span class='sk-ig-feed-m-r-15px'>";
            post_items += "<i class='fa fa-heart' aria-hidden='true'></i> " + val.likes_count;
            post_items += "</span>";
            post_items += "<span class='sk-ig-feed-m-r-15px'>";
            post_items += "<i class='fa fa-comment' aria-hidden='true'></i> " + val.comments_count;
            post_items += "</span>";
            post_items += "<span class='sk-ig-pop-up-icon'>";
            post_items += "<a href='" + val.view_on_ig_link + "' target='_blank'>";
            post_items += "<i class='fa fa-instagram' aria-hidden='true'></i> " + view_on_instagram_text;
            post_items += "</a>";
            post_items += "</span>";
        } else {
            post_items += "<span class='sk-ig-feed-m-r-15px'>";
            post_items += "<i class='fa fa-instagram' aria-hidden='true'></i> ";
            post_items += "<a href='https://www.instagram.com/" + val.post_by + "' target='_blank'>";
            post_items += val.post_by;
            post_items += "</a>";
            post_items += "</span>";
            post_items += "<span class='sk-ig-pop-up-icon'>";
            post_items += "<i class='fa fa-time' aria-hidden='true'></i> " + val.post_date;
            post_items += "</span>";
        }

        if (val.caption != null) {
            post_items += "<div class='sk-ig-feed-m-t-10px sk-ig-pic-text sk-ig-text-" + val.id + "'>";

            if (val.post_by != "") {
                post_items += "<a href='https://www.instagram.com/" + val.post_by + "' target='_blank'>";
                post_items += "<strong>" + val.post_by + "</strong>";
                post_items += "</a> ";
            }

            post_items += val.caption;
            post_items += "</div>";
        }

        if (val.time_ago != null) {
            post_items += "<div class='sk_ig_hashtag_feed_time_ago'>" + val.time_ago + "</div>";
        }
        post_items += "</div>";
        post_items += "</div>";

        post_items += "<div style='padding:5px;background-color:#fff;height:100px;'>";

        if (val.multi_hashtag == false) {
            post_items += "<span class='sk-ig-feed-m-r-15px'>";
            post_items += "<i class='fa fa-heart' aria-hidden='true'></i> " + val.likes_count;
            post_items += "</span>";
            post_items += "<span class='sk-ig-feed-m-r-15px'>";
            post_items += "<i class='fa fa-comment' aria-hidden='true'></i> " + val.comments_count;
            post_items += "</span>";
        } else {
            post_items += "<span class='sk-ig-feed-m-r-15px'>";
            post_items += "<i class='fa fa-instagram' aria-hidden='true'></i> ";
            post_items += "<a href='https://www.instagram.com/" + val.post_by + "' target='_blank'>";
            post_items += val.post_by;
            post_items += "</a>";
            post_items += "</span>";
            post_items += "<span class='sk-ig-pop-up-icon'>";
            post_items += "<i class='fa fa-time' aria-hidden='true'></i> " + val.post_date;
            post_items += "</span>";
        }

        if (val.caption != null) {
            post_items += "<div class='limit-two-lines sk-ig-feed-m-t-10px sk-ig-pic-text sk-ig-text-" + val.id + "'>";

            if (val.post_by != "") {
                post_items += "<a href='https://www.instagram.com/" + val.post_by + "' target='_blank'>";
                post_items += "<strong>" + val.post_by + "</strong>";
                post_items += "</a> ";
            }

            post_items += "\"" + val.caption + "\"";
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "<span class='date_time_posted_span' data-code='" + val.code + "' style='display:none;'>" + val.post_date + "</span>";

        post_items += "</div>"; // END sk-ww-instagram-hashtag-feed-item

        return post_items;
    }

    function showPopUp(jQuery, content_src, clicked_element) {
        // pop up options
        var sk_instagram_feed = jQuery(this).closest('.sk-ww-instagram-hashtag-feed')

        // open pop up
        jQuery.magnificPopup.open({
            items: { src: content_src },
            'type': 'inline',
            callbacks: {
                open: function() {

                    // show prev / next nav
                    var post_html = "";
                    if (clicked_element.prev().length > 0) {
                        post_html += "<button type='button' class='prev-sk-post'>";
                        post_html += "<i class='fa fa-chevron-left sk_prt_4px' aria-hidden='true'></i>";
                        post_html += "</button>";
                    }

                    if (clicked_element.next().length > 0) {
                        post_html += "<button type='button' class='next-sk-post'>";
                        post_html += "<i class='fa fa-chevron-right sk_plt_4px' aria-hidden='true'></i>";
                        post_html += "</button>";
                    }

                    jQuery('.sk-media-post-container').prepend(post_html);

                    // make link clickable
                    jQuery('.mfp-content .sk-ig-pic-text').css({
                        'font-family': "Verdana, Geneva, sans-serif"
                    });
                    initializeSwiperSingleSLider(clicked_element)

                    // play video
                    if (jQuery('.mfp-content .sk-pop-ig-post video').get(0) !== undefined) {
                        jQuery('.mfp-content .sk-pop-ig-post video').get(0).play();
                    }

                },
                close: function() {
                    // remove prev / next buttons
                    jQuery(".prev-sk-post, .next-sk-post").remove();
                    jQuery('video.ig_media').each(function() {
                        $(this)[0].pause();
                    });
                }
            }
        });

    }

    function initializeSwiperSingleSLider(clicked_element) {
        var singleSwiper = new Swiper('.swiper-container-single', {
            slidesPerView: 1,
            spaceBetween: 30,
            effect: 'fade',
            autoplay: 3000,

            // loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next-single',
                prevEl: '.swiper-button-prev-single',
            },
        });
        jQuery('.swiper-container-single .swiper-button-next-single,.swiper-container-single .swiper-button-prev-single').css({
            'top': "100%",
            'width': "34px",
            'height': "16px",
        });
        var h = jQuery('.swiper-container-single .swiper-slide-active img,.swiper-container-single .swiper-slide-active video').innerHeight();
        // var h = jQuery('.swiper-container-single .swiper-slide-active video').innerHeight();
        jQuery('.swiper-container-single').css('height', h + 'px');
        jQuery('.swiper-container-single .swiper-slide-active').css("width", "100%");
        jQuery('.swiper-container-single').css("padding", "0 0 37px 0");
        jQuery('.swiper-layout-slider .swiper-slide-active').css('width', '100%');
    }

    function replaceContentWithLinks(html) {
        var text = html.html();
        text = text.replace(/(\r\n|\n\r|\r|\n)/g, "<br>");
        text = text.replace(/#(\w+)/g, '<a target="_blank" href="http://instagram.com/explore/tags/$1">#$1</a>');
        text = text.replace(/@([a-z\d_]+)/ig, '<a target="_blank" href="http://instagram.com/$1">@$1</a>');
        html.html(text);
        var sk_instagram_feed = jQuery('.sk-ww-instagram-hashtag-feed');
        applyCustomUi(jQuery, sk_instagram_feed);
    }

    function applyCustomUi(jQuery, sk_instagram_feed) {

        // hide 'loading animation' image
        sk_instagram_feed.find(".loading-img").hide();

        // container width
        sk_instagram_feed.css({
            'width': '100%',
            'display': 'block'
        });

        // feed width
        var sk_instagram_feed_width = sk_instagram_feed.outerWidth(true).toFixed(0);

        // change height to normal
        sk_instagram_feed.css({ 'height': 'auto' });

        // identify column count
        var column_count = sk_instagram_feed.find('.column_count').text();
        if (
            /* smartphones, iPhone, portrait 480x320 phones */
            sk_instagram_feed_width <= 320 ||

            /* portrait e-readers (Nook/Kindle), smaller tablets @ 600 or @ 640 wide. */
            sk_instagram_feed_width <= 481 ||

            /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
            sk_instagram_feed_width <= 641
        ) {
            column_count = 2;

            if (getDsmSetting(sk_instagram_feed, "column_count") == 1) {
                column_count = 1;
            }
        }

        // size settings
        var border_size = 0;
        var background_color = "#555555";
        var space_between_images = parseFloat(sk_instagram_feed.find('.space_between_images').text());
        var margin_between_images = parseFloat(parseFloat(space_between_images).toFixed(0) / 2);

        var total_space_between_images = parseFloat(space_between_images).toFixed(2) * parseFloat(column_count);
        var pic_width = (parseFloat(sk_instagram_feed_width).toFixed(0) - parseFloat(total_space_between_images).toFixed(0)) / parseFloat(column_count).toFixed(0);
        var load_more_btn_width = (parseFloat(pic_width) * parseFloat(column_count)) + ((parseFloat(space_between_images) * parseFloat(column_count)) - parseFloat(space_between_images));

        // font & color settings
        var font_family = sk_instagram_feed.find('.font_family').text();
        var details_bg_color = sk_instagram_feed.find('.details_bg_color').text();
        var details_font_color = sk_instagram_feed.find('.details_font_color').text();
        var details_link_color = sk_instagram_feed.find('.details_link_color').text();
        var details_link_hover_color = sk_instagram_feed.find('.details_link_hover_color').text();
        var button_bg_color = sk_instagram_feed.find('.button_bg_color').text();
        var button_text_color = sk_instagram_feed.find('.button_text_color').text();
        var button_hover_bg_color = sk_instagram_feed.find('.button_hover_bg_color').text();
        var button_hover_text_color = sk_instagram_feed.find('.button_hover_text_color').text();
        var title_line_height = sk_instagram_feed.find('.title_line_height').text();
        var post_item_type = getDsmSetting(sk_instagram_feed, "post_item_type");

        sk_instagram_feed.find('.sk-ww-instagram-hashtag-feed-item').css({
            'width': pic_width + 'px',
            'height': (post_item_type == 1 ? pic_width + 92 : pic_width) + 'px',
            'margin': margin_between_images + 'px',
            'background-color': background_color,
            'padding': border_size
        });

        // hashtag title
        sk_instagram_feed.find('.sk-ig-profile-usename, .sk-ig-profile-usename a').css({
            'color': details_font_color,
            'line-height': title_line_height + 'px',
            'text-decoration': 'none'
        });

        // hover
        var hover_width = sk_instagram_feed.find('.sk-ww-instagram-hashtag-feed-item').width();
        sk_instagram_feed.find('.sk-ig-post-hover').css({
            'width': hover_width + 'px',
            'height': hover_width + 'px',
            'margin': 0,
            'padding': 0,
            'line-height': hover_width + 'px'
        });

        // resize the actual image as well
        sk_instagram_feed.find('.sk-ww-instagram-hashtag-feed-item .sk-ig-post-img').css({
            'width': pic_width + 'px',
            'height': pic_width + 'px'
        });

        // apply font family
        sk_instagram_feed.css({
            'font-family': font_family,
            'background-color': details_bg_color
        });

        // pop up settings
        jQuery('.sk-pop-ig-post').css({
            'font-family': font_family
        });

        // details
        sk_instagram_feed.find('.instagram-user-root-container').css({
            'color': details_font_color
        });

        // details link
        sk_instagram_feed.find('.instagram-user-root-container a').css({
            'color': details_link_color
        });

        $(".instagram-user-root-container a").mouseover(function() {
            $(this).css({ 'color': details_link_hover_color });
        }).mouseout(function() {
            $(this).css({ 'color': details_link_color });
        });
        sk_instagram_feed.find(".sk-ig-bottom-btn-container").css({
            "display": "block",
            "overflow": "hidden",
            "margin": "0",

        });

        // buttons
        var margin_bottom_sk_ig_load_more_posts = space_between_images / 2;
        if (margin_bottom_sk_ig_load_more_posts == 0) {
            margin_bottom_sk_ig_load_more_posts = 3;
        }

        sk_instagram_feed.find(".sk-ig-load-more-posts").css({
            'margin-bottom': margin_bottom_sk_ig_load_more_posts + 'px',
            'width': load_more_btn_width + 'px'
        });

        sk_instagram_feed.find(".instagram-user-container, .sk-ig-load-more-posts, .sk-ig-bottom-follow-btn")
            .css({
                'background-color': button_bg_color,
                'border-color': button_bg_color,
                'color': button_text_color
            });

        sk_instagram_feed.find(".instagram-user-container, .sk-ig-load-more-posts, .sk-ig-bottom-follow-btn")
            .mouseover(function() {
                $(this).css({
                    'background-color': button_hover_bg_color,
                    'border-color': button_hover_bg_color,
                    'color': button_hover_text_color
                });
            }).mouseout(function() {
                $(this).css({
                    'background-color': button_bg_color,
                    'border-color': button_bg_color,
                    'color': button_text_color
                });
            });

        // bottom buttons container
        var padding_sk_ig_bottom_btn_container = margin_between_images;
        if (padding_sk_ig_bottom_btn_container == 0) {
            padding_sk_ig_bottom_btn_container = 5;
        }
        sk_instagram_feed.find(".sk-ig-bottom-btn-container").css({
            'padding': padding_sk_ig_bottom_btn_container + 'px'
        });

        jQuery(".sk-media-post-container, .mfp-close, .prev-sk-post, .next-sk-post")
            .mouseover(function() {
                jQuery(".mfp-close, .prev-sk-post, .next-sk-post").attr("style", "opacity: 0.8 !important;");
            }).mouseout(function() {
                jQuery(".mfp-close, .prev-sk-post, .next-sk-post").attr("style", "opacity: 0.3 !important;");
            });

        // .sk-fb-event-item
        sk_instagram_feed.find('.sk-fb-event-item, .sk_powered_by').css({ 'margin-bottom': getDsmSetting(sk_instagram_feed, "space_between_events") + 'px' });

        // change the height of slider after 0.5 sec
        if (getDsmSetting(sk_instagram_feed, "layout") == 3) {
            skLayoutSliderArrowUI(sk_instagram_feed);
            setTimeout(
                function() {
                    skLayoutSliderArrowUI(sk_instagram_feed);
                }, 500);
            setTimeout(
                function() {
                    skLayoutSliderArrowUI(sk_instagram_feed);
                }, 800);
        }

        // reset container width to 100%
        sk_instagram_feed.css({
            'width': '100%',
            'display': 'block'
        });

        // apply custom css
        jQuery('head').append('<style type="text/css">' + getDsmSetting(sk_instagram_feed, "custom_css") + '</style>');
    }

    // our main function
    function main() {

        // manipulate page using jQuery
        jQuery(document).ready(function($) {

            jQuery('.sk-ww-instagram-hashtag-feed').each(function() {

                // know what to show
                var sk_instagram_feed = jQuery(this);
                var embed_id = getDsmEmbedId(sk_instagram_feed);

                // get current url & settings
                // var current_url=encodeURIComponent(window.location.href);
                // var json_url=app_url + "embed/instagram-hashtag-feed/widget_settings_json.php?embed_id=" + embed_id + "&current_url=" + current_url;
                var json_url = app_url + "embed/instagram-hashtag-feed/widget_settings_json.php?embed_id=" + embed_id;

                jQuery.getJSON(json_url, function(data) {

                    // load google font
                    var web_safe_fonts = [
                        "Inherit", "Impact, Charcoal, sans-serif", "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
                        "Century Gothic, sans-serif", "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", "Verdana, Geneva, sans-serif",
                        "Copperplate, 'Copperplate Gothic Light', fantasy", "'Courier New', Courier, monospace", "Georgia, Serif"
                    ];

                    var is_font_included = web_safe_fonts.indexOf(data.font_family);
                    if (is_font_included < 0) { loadCssFile("https://fonts.googleapis.com/css?family=" + data.font_family); }


                    if (data.show_feed == false) {

                        sk_instagram_feed.find('.loading-img').hide();

                        if (embed_id == 17624) { data.message = "ERROR. Please contact admin of this website."; }
                        sk_instagram_feed.prepend(data.message);
                    } else {

                        // change height to be more than current window
                        if (data.show_content_space == 1) {
                            var new_sk_instagram_feed_height = jQuery(window).height() + 100;
                            sk_instagram_feed.height(new_sk_instagram_feed_height);
                        }

                        // save some settings in html
                        var settings_html = "";

                        // settings for easy access
                        settings_html += "<div style='display:none;' class='display-none sk-ig-settings'>";
                        jQuery.each(data, function(key, value) { settings_html += "<div class='" + key + "'>" + value + "</div>"; });
                        settings_html += "</div>";

                        if (sk_instagram_feed.find('.sk-ig-settings').length) {} else { sk_instagram_feed.prepend(settings_html); }

                        // empty settings
                        settings_html = "";

                        var layout = getDsmSetting(sk_instagram_feed, "layout");


                        var layout = getDsmSetting(sk_instagram_feed, "layout");
                        if (layout == 3) {
                            loadInstagramFeedForSliderLayout(jQuery, sk_instagram_feed);
                        } else {
                            loadInstagramFeed(jQuery, sk_instagram_feed);
                        }



                    }
                });
            });

            // resize elements in real time
            jQuery(window).resize(function() {
                jQuery('.sk-ww-instagram-hashtag-feed').each(function() {
                    var sk_instagram_feed = jQuery(this);
                    applyCustomUi(jQuery, sk_instagram_feed);
                });
            });

            jQuery(document).on('click', '.prev-sk-post', function() {
                // clicked 'next' button
                var clicked_element = jQuery(this);

                // next post item
                var new_clicked_element = jQuery('.sk_selected_ig_post').prev('.sk-ww-instagram-hashtag-feed-item');

                // content of pop up
                var content_src = new_clicked_element.find('.sk-pop-ig-post');

                // activate new selected post
                jQuery('.sk_selected_ig_post').removeClass('sk_selected_ig_post');
                new_clicked_element.addClass('sk_selected_ig_post');

                // close current pop up
                hidePopUp();

                // show new pop up
                showPopUp(jQuery, content_src, new_clicked_element);
            });

            jQuery(document).on('click', '.next-sk-post', function() {

                // clicked 'next' button
                var clicked_element = jQuery(this);

                // next post item
                var new_clicked_element = jQuery('.sk_selected_ig_post').next('.sk-ww-instagram-hashtag-feed-item');

                // content of pop up
                var content_src = new_clicked_element.find('.sk-pop-ig-post');

                // activate new selected post
                jQuery('.sk_selected_ig_post').removeClass('sk_selected_ig_post');
                new_clicked_element.addClass('sk_selected_ig_post');

                // close current pop up
                hidePopUp();

                // show new pop up
                showPopUp(jQuery, content_src, new_clicked_element);
            });

            jQuery(document).on('click', '.sk-ww-instagram-hashtag-feed .sk-ww-instagram-hashtag-feed-item', function() {
                // remove all selected post
                jQuery('.sk_selected_ig_post').removeClass('sk_selected_ig_post');

                var clicked_element = jQuery(this);
                var content_src = clicked_element.find('.sk-pop-ig-post');

                // activate selected post
                clicked_element.addClass('sk_selected_ig_post');

                showPopUp(jQuery, content_src, clicked_element);


            });

            jQuery(document).on('click', '.sk-ww-instagram-hashtag-feed .sk-ig-load-more-posts', function() {

                var current_btn = jQuery(this);
                var current_btn_text = current_btn.text();
                var sk_instagram_feed = jQuery(this).closest('.sk-ww-instagram-hashtag-feed');
                var embed_id = getDsmEmbedId(sk_instagram_feed);

                var next_page = sk_instagram_feed.find('.sk-ig-next-page').text();
                var json_url = next_page;
                var view_on_instagram_text = sk_instagram_feed.find('.view_on_instagram_text').text();
                var show_post_hover = sk_instagram_feed.find('.show_post_hover').text();

                // show loading animation
                jQuery(this).html("<i class='fa fa-spinner fa-pulse' aria-hidden='true'></i>");

                if (json_url == "") {
                    sk_instagram_feed.find(".sk-ww-instagram-hashtag-feed-item").show();
                    sk_instagram_feed.find('.sk-ig-load-more-posts').hide();
                } else {
                    // get events
                    jQuery.getJSON(json_url, function(data) {

                        var post_items = "";

                        jQuery.each(data.posts, function(key, val) {

                            val['view_on_instagram_text'] = view_on_instagram_text;
                            val['show_post_hover'] = show_post_hover;
                            val['display_none'] = '';
                            post_items += getFeedItem(val, sk_instagram_feed);
                            getFreshPopUpContent(val)
                            sk_instagram_feed.find('.sk-ww-instagram-hashtag-feed-item').show();
                        });


                        // add posts to current posts
                        sk_instagram_feed.find('.sk-ig-all-posts').append(post_items);

                        // skIgFeedSetThumbnails(data)
                        // go back to previous button text
                        current_btn.html(current_btn_text);

                        // change next page value
                        sk_instagram_feed.find('.sk-ig-next-page').text(data.page_info.next_page_url);


                        // if no next page, disable load more button
                        if (data.page_info.next_page_url == "") {
                            sk_instagram_feed.find('.sk-ig-load-more-posts').hide();
                        }

                        syncDateTimePosted();
                        // apply customizations and sizings
                        applyCustomUi(jQuery, sk_instagram_feed);
                        jQuery.each(data.posts, function(key, val) {
                            replaceContentWithLinks(jQuery(".sk-ig-text-" + val.id));
                        });

                    });
                }

            });

            jQuery(document).on('click', '.sk-ww-instagram-hashtag-feed .sk-watermark', function() {
                jQuery('.sk-ww-instagram-hashtag-feed .sk-message').slideToggle();
            });
        }); // end document ready
    }
}(window, document));