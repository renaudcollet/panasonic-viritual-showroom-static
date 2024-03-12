/**
 *  Google Analytics
 */

// @ts-nocheck
export default class GoogleTagCustom {
  constructor() {}

  addTags() {
    // Google Tag Manager
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-N8GV278');
    
    var target = document.querySelector('head');

    // Global site tag (gtag.js) - Google Analytics
    var newScript = document.createElement("script");
    newScript.src = "https://www.googletagmanager.com/gtag/js?id=UA-10374611-1";
    target.appendChild(newScript);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-10374611-1');
    
    // Global site tag (gtag.js) - Google Ads: 1012919455
    newScript = document.createElement("script");
    newScript.src = "https://www.googletagmanager.com/gtag/js?id=AW-1012919455";
    target.appendChild(newScript);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-1012919455');
    
    // Event snippet for Arrivée LP conversion page
    gtag('event', 'conversion', {'send_to': 'AW-1012919455/DjkyCLT7uZMCEJ_Z_-ID'});
  }
}
