/* eslint-disable */
/**
 * Filename must change if contents of this file changes
 */
window.cvtUnsupportedBrowser = true;
var scriptElement = document.getElementById('internet-explorer-is-dead');
var assetRoot = scriptElement.getAttribute('data-asset-root');
var language = scriptElement.getAttribute('data-culture-code');
var languageFallback1 = language.split('-')[0];
var languageFallback2 = 'en';

var imageUrl = assetRoot + 'images/ie-error.v1.svg';
var allText = {
  'bg': {
    'IE-Compatibility-modal-content': 'Това събитие вече не поддържа напълно Internet Explorer 11. Можете да продължите да ползвате този браузър, но Ви препоръчваме да ползвате последната версия на Chrome, Edge, Firefox или Safari за най-добро възприятие.',
    'IE-Compatibility-modal-continue-text': 'Продължи',
    'IE-Compatibility-modal-header': 'Вече не поддържаме Internet Explorer',
    'IE-Compatibility-modal-info-text': 'Научете повече',
    'IE-Support-Body': 'Това събитие вече не поддържа Internet Explorer 11. Поддържаме последните версии на Chrome, Edge, Firefox или Safari. '
  },
  'cs': {
    'IE-Compatibility-modal-content': 'Tato událost již plně nepodporuje prohlížeč Internet Explorer 11. Tento prohlížeč můžete nadále používat. Doporučujeme ovšem, abyste používali nejnovější verze internetového prohlížeče Chrome, Edge, Firefox nebo Safari.',
    'IE-Compatibility-modal-continue-text': 'Pokračovat',
    'IE-Compatibility-modal-header': 'Prohlížeč Internet Explorer již není podporován',
    'IE-Compatibility-modal-info-text': 'Další informace',
    'IE-Support-Body': 'Tato událost již nepodporuje prohlížeč Internet Explorer 11. Podporujeme nejnovější verze prohlížečů Chrome, Edge, Firefox a Safari.',
  },
  'da': {
    'IE-Compatibility-modal-content': 'Denne event understøtter ikke fuldt ud Internet Explorer 11. Du kan fortsat bruge browseren, men vi anbefaler, at du bruger den nyeste version af Chrome, Edge, Firefox eller Safari for at få den bedste oplevelse.',
    'IE-Compatibility-modal-continue-text': 'Fortsæt',
    'IE-Compatibility-modal-header': 'Internet Explorer understøttes ikke længere',
    'IE-Compatibility-modal-info-text': 'Lær mere',
    'IE-Support-Body': 'Denne event understøtter ikke længere Internet Explorer 11. Vi understøtter de nyeste versioner af Chrome, Edge, Firefox og Safari.'
  },
  'de': {
    'IE-Compatibility-modal-content': 'Dieses Event unterstützt Internet Explorer 11 nicht mehr in vollem Umfang. Sie können diesen Browser weiterhin verwenden, aber wir empfehlen für die optimale Darstellung die Verwendung der aktuellen Versionen von Chrome, Edge, Firefox oder Safari.',
    'IE-Compatibility-modal-continue-text': 'Fortsetzen',
    'IE-Compatibility-modal-header': 'Internet Explorer wird nicht mehr unterstützt',
    'IE-Compatibility-modal-info-text': 'Erfahren Sie mehr',
    'IE-Support-Body': 'Dieses Event unterstützt Internet Explorer 11 nicht mehr. Wir unterstützten die neuesten Versionen von Chrome, Edge, Firefox oder Safari.'
  },
  'el': {
    'IE-Compatibility-modal-content': 'Αυτή η εκδήλωση δεν υποστηρίζει πλήρως τον Internet Explorer 11. Εξακολουθείτε να μπορείτε να χρησιμοποιείτε αυτό το πρόγραμμα περιήγησης, αλλά συνιστούμε να χρησιμοποιήσετε την τελευταία έκδοση του Chrome, Edge, Firefox ή Safari για να λάβετε την καλύτερη δυνατή εμπειρία.',
    'IE-Compatibility-modal-continue-text': 'Συνέχεια',
    'IE-Compatibility-modal-header': 'Ο Internet Explorer δεν υποστηρίζεται πλέον',
    'IE-Compatibility-modal-info-text': 'Μάθετε περισσότερα',
    'IE-Support-Body': 'Αυτή η εκδήλωση δεν υποστηρίζει πλέον τον Internet Explorer 11. Υποστηρίζουμε τις τελευταίες εκδόσεις των Chrome, Edge, Firefox ή Safari.'
  },
  'en': {
    'IE-Compatibility-modal-content': 'This event no longer fully supports Internet Explorer 11. You can still continue using this browser, but we recommend using the latest version of Chrome, Edge, Firefox, or Safari to get the best experience.',
    'IE-Compatibility-modal-continue-text': 'Continue',
    'IE-Compatibility-modal-header': 'Internet Explorer is no longer supported',
    'IE-Compatibility-modal-info-text': 'Learn more',
    'IE-Support-Body': 'This event no longer supports Internet Explorer 11. We support the latest versions of Chrome, Edge, Firefox, or Safari.',
  },
  'es': {
    'IE-Compatibility-modal-content': 'Este evento ya no funciona bien con Internet Explorer 11. Siempre puede seguir usando ese navegador, pero le recomendamos usar la versión más reciente de Chrome, Edge, Firefox o Safari para tener una mejor experiencia.',
    'IE-Compatibility-modal-continue-text': 'Continuar',
    'IE-Compatibility-modal-header': 'Ya no se respalda el uso de Internet Explorer',
    'IE-Compatibility-modal-info-text': 'Mayor información',
    'IE-Support-Body': 'Este evento ya no funciona con Internet Explorer 11. Funcionamos con las versiones más recientes de Chrome, Edge, Firefox o Safari.'
  },
  'fi': {
    'IE-Compatibility-modal-content': 'Tämä tapahtuma ei enää tue täysin Internet Explorer 11:tä. Voit silti edelleen käyttää tätä selainta, mutta suosittelemme käyttämään Chromen, Edgen, Firefoxin tai Safarin uusinta versiota parhaimman käyttökokemuksen saamiseksi.',
    'IE-Compatibility-modal-continue-text': 'Jatka',
    'IE-Compatibility-modal-header': 'Internet Exploreria ei enää tueta',
    'IE-Compatibility-modal-info-text': 'Opi lisää',
    'IE-Support-Body': 'Tämä tapahtuma ei enää tue Internet Explorer 11:tä. Tuemme Chromen, Edgen, Firefoxin ja Safarin uusimpia versioita.'
  },
  'fr-CA': {
    'IE-Compatibility-modal-content': 'Cet événement ne prend plus entièrement en charge Internet Explorer 11. Vous pouvez toujours continuer à utiliser ce navigateur, mais nous vous recommandons d’utiliser la dernière version de Chrome, Edge, Firefox ou Safari pour obtenir la meilleure expérience possible.',
    'IE-Compatibility-modal-continue-text': 'Continuer',
    'IE-Compatibility-modal-header': 'Internet Explorer n’est plus pris en charge',
    'IE-Compatibility-modal-info-text': 'En savoir plus',
    'IE-Support-Body': 'Cet événement ne prend plus en charge Internet Explorer 11. Nous prenons en charge les dernières versions de Chrome, Edge, Firefox ou Safari.'
  },
  'fr': {
    'IE-Compatibility-modal-content': "Cet événement ne prend plus entièrement en charge Internet Explorer 11. Vous pouvez toujours continuer à utiliser ce navigateur, mais nous vous recommandons d'utiliser la dernière version de Chrome, Edge, Firefox ou Safari pour obtenir la meilleure expérience possible.",
    'IE-Compatibility-modal-continue-text': 'Continuer',
    'IE-Compatibility-modal-header': "Internet Explorer n'est plus pris en charge",
    'IE-Compatibility-modal-info-text': 'En savoir plus',
    'IE-Support-Body': 'Cet événement ne prend plus en charge Internet Explorer 11. Nous prenons en charge les dernières versions de Chrome, Edge, Firefox ou Safari.'
  },
  'hr': {
    'IE-Compatibility-modal-content': 'Ovaj događaj više ne podržava u potpunosti Internet Explorer 11. I dalje možete upotrebljavati ovaj preglednik, ali preporučujemo upotrebu najnovije verzije Chromea, Edgea, Firefoxa ili Safarija za najbolje iskustvo pregledavanja.',
    'IE-Compatibility-modal-continue-text': 'Dalje',
    'IE-Compatibility-modal-header': 'Internet Explorer više nije podržan',
    'IE-Compatibility-modal-info-text': 'Saznajte više',
    'IE-Support-Body': 'Ovaj događaj više ne podržava Internet Explorer 11. Podržavamo najnovije verzije preglednika Chrome, Edge, Firefox ili Safari.'
  },
  'hu': {
    'IE-Compatibility-modal-content': 'Ez az esemény már nem támogatja teljes mértékben az Internet Explorer 11-et. Továbbra is használhatja ezt a böngészőt, de a legjobb élmény eléréséhez javasoljuk a Chrome, az Edge, a Firefox vagy a Safari legújabb verziójának használatát.',
    'IE-Compatibility-modal-continue-text': 'Tovább',
    'IE-Compatibility-modal-header': 'Az Internet Explorer már nem támogatott.',
    'IE-Compatibility-modal-info-text': 'Bővebben',
    'IE-Support-Body': 'Ez a rendezvény már nem támogatja az Internet Explorer 11-et. A Chrome, az Edge, a Firefox és a Safari legújabb verzióit támogatjuk.'
  },
  'it': {
    'IE-Compatibility-modal-content': 'Questo evento non supporta più completamente Internet Explorer 11. Puoi continuare a utilizzare questo browser, ma per la migliore esperienza possibile ti consigliamo di utilizzare la versione più recente di Chrome, Edge, Firefox o Safari.',
    'IE-Compatibility-modal-continue-text': 'Continua',
    'IE-Compatibility-modal-header': 'Internet Explorer non è più supportato',
    'IE-Compatibility-modal-info-text': 'Scopri di più',
    'IE-Support-Body': 'Questo evento non supporta più Internet Explorer 11. Supportiamo le versioni più recenti di Chrome, Edge, Firefox o Safari.'
  },
  'ja': {
    'IE-Compatibility-modal-content': 'このイベントではもう Internet Explorer 11 に完全には対応していません。このブラウザーを使い続けることはできますが、より快適な操作のためには、最新版の Chrome、Edge、Firefox、または Safari のご利用をお奨めします。 ',
    'IE-Compatibility-modal-continue-text': '続行',
    'IE-Compatibility-modal-header': 'Internet Explorer にはもう対応していません',
    'IE-Compatibility-modal-info-text': '詳細を参照',
    'IE-Support-Body': 'このイベントはすでに Internet Explorer 11 には対応していません。Chrome、Edge、Firefox、または Safari の最新版に対応しています。'
  },
  'ko': {
    'IE-Compatibility-modal-content': '이 이벤트는 이제 인터넷 익스플로러 11을 지원하지 않습니다. 이 브라우저를 계속 사용할 수는 있지만, 최상의 경험을 위해 Chrome, Edge, Firefox, 또는 Safari의 최신 버전을 사용하도록 권장합니다.',
    'IE-Compatibility-modal-continue-text': '계속하기',
    'IE-Compatibility-modal-header': '더는 인터넷 익스플로러를 지원하지 않습니다',
    'IE-Compatibility-modal-info-text': '더 많은 정보',
    'IE-Support-Body': '이 이벤트는 더는 인터넷 익스플로러 11을 지원하지 않습니다. 크롬, 엣지, 파이어폭스, 또는 사파리 브라우저의 최신 버전을 지원합니다:'
  },
  'nb': {
    'IE-Compatibility-modal-content': 'Dette arrangementet støtter ikke lenger Internet Explorer 11. Du kan fortsatt fortsette å bruke denne nettleseren, men vi anbefaler at du bruker den nyeste versjonen av Chrome, Edge, Firefox eller Safari for å få den beste opplevelsen.',
    'IE-Compatibility-modal-continue-text': 'Fortsett',
    'IE-Compatibility-modal-header': 'Internet Explorer støttes ikke lenger',
    'IE-Compatibility-modal-info-text': 'Lær mer',
    'IE-Support-Body': 'Dette arrangementet støtter ikke lenger Internet Explorer 11. Vi støtter de nyeste versjonene av Chrome, Edge, Firefox og Safari.'
  },
  'nl': {
    'IE-Compatibility-modal-content': 'Dit evenement ondersteunt Internet Explorer 11 niet meer volledig. U kunt deze browser nog steeds gebruiken, maar we raden u aan de nieuwste versie van Chrome, Firefox of Safari te gebruiken voor een optimale ervaring.',
    'IE-Compatibility-modal-continue-text': 'Doorgaan',
    'IE-Compatibility-modal-header': 'Internet Explorer wordt niet meer ondersteund',
    'IE-Compatibility-modal-info-text': 'Meer informatie',
    'IE-Support-Body': 'Dit evenement ondersteunt Internet Explorer 11 niet meer. We ondersteunen de nieuwste versies van Chrome, Edge, Firefox en Safari.'
  },
  'pl': {
    'IE-Compatibility-modal-content': 'Internet Explorer 11 nie jest już w pełni obsługiwany w ramach tej imprezy. Możesz dalej korzystać z tej przeglądarki ale, aby osiągnąć lepsze wyniki, proponujemy najnowszą wersję Chrome, Edge, Firefox bądź Safari.',
    'IE-Compatibility-modal-continue-text': 'Kontynuuj',
    'IE-Compatibility-modal-header': 'Internet Explorer nie jest już obsługiwany',
    'IE-Compatibility-modal-info-text': 'Dowiedz się więcej',
    'IE-Support-Body': 'Internet Explorer 11 nie jest już obsługiwany w ramach tej imprezy/wydarzenia. Proponujemy najnowsze wersje Chrome, Edge, Firefox bądź Safari.'
  },
  'pt': {
    'IE-Compatibility-modal-content': 'Este evento não oferece mais suporte ao Internet Explorer 11. Você ainda pode continuar usando este navegador, mas recomendamos usar a versão mais recente do Chrome, Edge, Firefox ou Safari para obter a melhor experiência.',
    'IE-Compatibility-modal-continue-text': 'Continuar',
    'IE-Compatibility-modal-header': 'Não há mais suporte para o Internet Explorer',
    'IE-Compatibility-modal-info-text': 'Saiba mais',
    'IE-Support-Body': 'Este evento não oferece mais suporte ao Internet Explorer 11. Oferecemos suporte às versões mais recentes do Chrome, Edge, Firefox ou Safari.'
  },
  'pt-PT': {
    'IE-Compatibility-modal-content': 'Este evento já não suporta o Internet Explorer 11. Ainda pode continuar a utilizar este browser, mas recomendamos a utilização da versão mais recente do Chrome, Edge, Firefox ou Safari para obter a melhor experiência.',
    'IE-Compatibility-modal-continue-text': 'Continuar',
    'IE-Compatibility-modal-header': 'O Internet Explorer já não é suportado',
    'IE-Compatibility-modal-info-text': 'Saiba mais',
    'IE-Support-Body': 'Este evento já não suporta o Internet Explorer 11. Oferecemos suporte às versões mais recentes do Chrome, Edge, Firefox ou Safari.'
  },
  'ro': {
    'IE-Compatibility-modal-content': 'Acest eveniment nu mai acceptă în totalitate Internet Explorer 11. Puteți continua să folosiți acest browser, dar pentru a beneficia de cea mai bună experiență, vă recomandăm să folosiți cea mai recentă versiune de Chrome, Edge, Firefox sau Safari. ',
    'IE-Compatibility-modal-continue-text': 'Continuați',
    'IE-Compatibility-modal-header': 'Internet Explorer nu mai este acceptat',
    'IE-Compatibility-modal-info-text': 'Aflați mai multe',
    'IE-Support-Body': 'Acest eveniment nu mai acceptă Internet Explorer 11. Acceptăm cele mai recente versiuni de Chrome, Edge, Firefox sau Safari.'
  },
  'ru': {
    'IE-Compatibility-modal-content': 'Это мероприятие больше не поддерживает в полной мере Internet Explorer 11. Вы все еще можете продолжать использовать этот браузер, но мы рекомендуем использовать последнюю версию Chrome, Edge, Firefox или Safari, чтобы максимально эффективно пользоваться системой.',
    'IE-Compatibility-modal-continue-text': 'Продолжить',
    'IE-Compatibility-modal-header': 'Internet Explorer больше не поддерживается',
    'IE-Compatibility-modal-info-text': 'Узнать подробнее',
    'IE-Support-Body': 'Это мероприятие больше не поддерживает Internet Explorer 11. Мы поддерживаем последнии версии Chrome, Edge, Firefox или Safari.'
  },
  'sk': {
    'IE-Compatibility-modal-content': 'Toto podujatie už plne nepodporuje prehliadač Internet Explorer 11. Tento prehliadač môžete naďalej používať, ale pre čo najlepšie využitie odporúčame používať najnovšiu verziu prehliadača Chrome, Edge, Firefox alebo Safari.',
    'IE-Compatibility-modal-continue-text': 'Pokračovať',
    'IE-Compatibility-modal-header': 'Prehliadač Internet Explorer už nie je podporovaný',
    'IE-Compatibility-modal-info-text': 'Zistiť viac',
    'IE-Support-Body': 'Toto podujatie už nepodporuje program Internet Explorer 11. Podporujeme najnovšie verzie prehliadačov Chrome, Edge, Firefox alebo Safari.'
  },
  'sl': {
    'IE-Compatibility-modal-content': 'Ta dogodek ne nudi več celovite podpore brskalnika Internet Explorer 11. Še vedno lahko uporabljate brskalnik, vendar vam za najboljšo izkušnjo priporočamo uporabo najnovejše različice Chrome, Edge, Firefox ali Safari. ',
    'IE-Compatibility-modal-continue-text': 'Nadaljuj',
    'IE-Compatibility-modal-header': 'Sistem ne podpira več brskalnika Internet Explorer',
    'IE-Compatibility-modal-info-text': 'Nauči se več',
    'IE-Support-Body': 'Ta dogodek ne podpira več brskalnika Internet Explorer 11. Podpiramo najnovejše različice brskalnikov Chrome, Edge, Firefox ali Safari.'
  },
  'sr': {
    'IE-Compatibility-modal-content': 'Ovaj događaj više ne podržava u potpunosti Internet Explorer 11. I dalje možete da koristite ovaj pregledač, ali preporučujemo upotrebu najnovije verzije pregledača Chrome, Edge, Firefox ili Safari za najbolje iskustvo pregledanja.',
    'IE-Compatibility-modal-continue-text': 'Dalje',
    'IE-Compatibility-modal-header': 'Internet Explorer više nije podržan',
    'IE-Compatibility-modal-info-text': 'Saznajte više',
    'IE-Support-Body': 'Ovaj događaj više ne podržava Internet Explorer 11. Podržavamo najnovije verzije pregledača Chrome, Edge, Firefox ili Safari.'
  },
  'sv': {
    'IE-Compatibility-modal-content': 'Det här evenemanget stöder inte längre Internet Explorer helt. Du kan fortfarande fortsätta att använda webbläsaren men vi rekommenderar att du använder den senaste versionen av Chrome, Edge, Firefox eller Safari för att få den bästa upplevelsen.',
    'IE-Compatibility-modal-continue-text': 'Fortsätt',
    'IE-Compatibility-modal-header': 'Internet Explorer stöds inte längre',
    'IE-Compatibility-modal-info-text': 'Läs mer',
    'IE-Support-Body': 'Evenemanget stöder inte längre Internet Explorer 11. Vi stöder de senaste versionerna av Chrome, Edge, Firefox eller Safari.'
  },
  'th': {
    'IE-Compatibility-modal-content': 'งานนี้ไม่รองรับ Internet Explorer 11 เต็มรูปแบบอีกต่อไป คุณยังคงใช้เบราว์เซอร์นี้ต่อไปได้ แต่เราขอแนะนำให้ใช้ Chrome, Edge, Firefox หรือ Safari เวอร์ชันล่าสุดเพื่อรับประสบการณ์ที่ดีที่สุด',
    'IE-Compatibility-modal-continue-text': 'ดำเนินการต่อ',
    'IE-Compatibility-modal-header': 'ไม่รองรับ Internet Explorer อีกต่อไป',
    'IE-Compatibility-modal-info-text': 'เรียนรู้เพิ่มเติม',
    'IE-Support-Body': 'งานนี้ไม่รองรับ Internet Explorer 11 อีกต่อไป เรารองรับ Chrome, Edge, Firefox หรือ Safari เวอร์ชันล่าสุด'
  },
  'tr': {
    'IE-Compatibility-modal-content': "Bu etkinlik Internet Explorer 11'i artık desteklemiyor. Bu tarayıcıyı kullanmaya devam edebilirsiniz ancak en iyi deneyim için Chrome, Edge, Firefox veya Safari kullanmanızı tavsiye ediyoruz.",
    'IE-Compatibility-modal-continue-text': 'Devam et',
    'IE-Compatibility-modal-header': 'Internet Explorer desteklenmiyor',
    'IE-Compatibility-modal-info-text': 'Daha fazla bilgi',
    'IE-Support-Body': "Bu etlinlikte Internet Explorer 11 desteği bulunmamaktadır. Chrome, Edge, Firefox veya Safari'nin son versiyonları desteklenmektedir."
  },
  'uk': {
    'IE-Compatibility-modal-content': 'Ця подія більше не сумісна з браузером Internet Explorer 11. Ви все ще можете користуватися цим браузером, проте для найкращих результатів ми рекомендуємо використовувати останню версію Chrome, Edge, Firefox або Safari.',
    'IE-Compatibility-modal-continue-text': 'Продовжити',
    'IE-Compatibility-modal-header': 'Internet Explorer більше не підтримується',
    'IE-Compatibility-modal-info-text': 'Детальніше',
    'IE-Support-Body': 'Ця подія більше не сумісна з браузером Explorer 11. Ми підтримуємо останні версії браузерів Chrome, Edge, Firefox і Safari.',
  },
  'vi': {
    'IE-Compatibility-modal-content': 'Sự kiện này không còn hỗ trợ đầy đủ cho Internet Explorer 11. Bạn vẫn có thể tiếp tục sử dụng trình duyệt này, nhưng chúng tôi khuyên bạn nên sử dụng phiên bản mới nhất của Chrome, Edge, Firefox hoặc Safari để có được trải nghiệm tốt nhất.',
    'IE-Compatibility-modal-continue-text': 'Tiếp tục',
    'IE-Compatibility-modal-header': 'Internet Explorer không còn được hỗ trợ',
    'IE-Compatibility-modal-info-text': 'Tìm hiểu thêm',
    'IE-Support-Body': 'Sự kiện này không còn hỗ trợ Internet Explorer 11. Chúng tôi hỗ trợ các phiên bản mới nhất của Chrome, Edge, Firefox hoặc Safari.'
  },
  'zh-Hans': {
    'IE-Compatibility-modal-continue-text': '继续',
    'IE-Compatibility-modal-info-text': '了解更多信息',
    'IE-Support-Body': '此活动不再支持 Internet Explorer 11。我们支持最新版本的Chrome、Edge、Firefox，或 Safari。'
  },
  'zh-Hant': {
    'IE-Compatibility-modal-continue-text': '繼續',
    'IE-Compatibility-modal-info-text': '瞭解更多資訊',
    'IE-Support-Body': '此活動不再支援 Internet Explorer 11。 我們支援最新版本的Chrome、Edge、Firefox，或 Safari。'
  }
};

function translate(key) {
  return (allText[language] || {})[key] ||
    (allText[languageFallback1] || {})[key] ||
    (allText[languageFallback2] || {})[key];
}

var divStyles = 'font-size: 0.875rem;' +
  'font-family: Rubik, Helvetica, Arial;' +
  'color: rgb(26, 32, 38);' +
  'text-align: center;' +
  'width: 50%;' +
  'max-width: 375px;' +
  'margin-bottom: 16px;' +
  'margin-top: 30px;';

window.closeUnsupportedBrowserMessage = function () {
  var elem = document.getElementById("unsupported-browser-message");
  elem.parentElement.removeChild(elem);
  window.loadInUnsupportedBrowser();
}

var div = document.createElement('div');
div.id = "unsupported-browser-message";
div.style = 'width: 100%;';
div.innerHTML =
  '<div style="max-width: 500px; margin: auto; line-height: 1.5;">' +
  '<div style="text-align: center;margin-left: auto;margin-right: auto;">' +
  '<img style="width: 50%; max-width: 375px; height: auto; margin-bottom: 16px; margin-top: 30px;" src="' + imageUrl + '" alt="' + translate('IE-Compatibility-modal-header') + '" />' +
  '<div style="font-size: 1.5rem; font-weight: 400; color: rgb(26, 32, 38); margin-bottom: 16px;">' + translate('IE-Compatibility-modal-header') + '<div/>' +
  '<div style="font-size: 1rem;font-weight: 400;color: rgb(105, 113, 122);margin-left: 8px;margin-right: 8px;">' + translate('IE-Support-Body') + '</div>' +
  '<button style="align-items: center;justify-content: center;box-sizing: border-box;cursor: pointer;' +
  'transition: background-color 140ms ease-out 0s, color 140ms ease-out 0s, border-color 140ms ease-out 0s;' +
  'border: 1px solid rgb(0, 106, 225);outline-offset: 3px;color: rgb(255, 255, 255);' +
  'background-color: rgb(0, 106, 225);border-radius: 0.25rem;box-shadow: rgb(0 0 0 / 0%) 0px 0px 0px 2px;' +
  'min-width: 112px;font-size: calc(1.125rem);line-height: 1.125;' +
  'width: auto;padding: 0.5rem 1rem;font-family: Rubik, Helvetica, Arial;font-style: normal;letter-spacing: 0px;' +
  'font-weight: 400; margin-top: 25px;" onClick="closeUnsupportedBrowserMessage()">' + translate('IE-Compatibility-modal-continue-text') + '</button>' +
  '</div>' +
  '</div>';

scriptElement.parentElement.appendChild(div);


