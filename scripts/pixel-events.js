// This script contains Meta Pixel initialization and a wrapper function for custom events.

// Meta Pixel Code Initialization (should run once per page load)
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1899574337508255');
fbq('track', 'PageView');
fbq('trackCustom', 'ViewedHowItWorks'); // Custom event for this page

/**
 * Wrapper function for tracking custom Meta Pixel events.
 * Ensures fbq is defined before attempting to track.
 * @param {string} eventName - The name of the custom event.
 * @param {object} data - Optional data object to send with the event.
 */
function trackEvent(eventName, data = {}) {
    if (typeof fbq === 'function') {
        fbq('trackCustom', eventName, data);
    } else {
        console.warn('fbq is not defined. Meta Pixel event not tracked:', eventName, data);
    }
}

// Event listeners for Meta Pixel tracking, wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Event: "Explore the System" button click
    document.getElementById('exploreSystemBtn')?.addEventListener('click', function () {
        trackEvent('ClickedExploreSystem');
    });

    // Event: "Schedule a Pilot Walkthrough" button click
    document.getElementById('schedulePilotBtn')?.addEventListener('click', function () {
        trackEvent('ClickedSchedulePilot');
    });

    // Event: "Learn More" toggle clicks
    document.querySelectorAll('.learn-more-toggle').forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('ExpandedLearnMore', {
                section_title: this.closest('.flow-step')?.querySelector('h3')?.textContent || 'Unknown Section'
            });
        });
    });
});
