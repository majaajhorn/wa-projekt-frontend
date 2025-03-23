# Next thing to do:

## MY PROFILE ##
- ~~napraviti da se vidi ime i prezime (dohvatiti iz baze)~~
- ~~email (opcija da se promijeni email - mijenjaj i u bazi čim se izmjeni)~~
- ~~password (mora biti mogućnost da se može sakriti i opcija da se promijeni password - također mijenjaj i bazu)~~
- ~~gender (odabir spola)~~
- ~~english language level - dropdown~~
- ~~care qualification - dropdown~~
- location (korisnik mora unijeti svoju lokaciju) --> ovo moramo poboljšati da korisnik unese lokaciju pomoću maps(api neki)
- ~~driving licence (dropdown)~~
- ~~live-in experience (dropdown)~~
- ~~general care experience (dropdown)~~
- ~~profile picture (saveat možda kao string u bazu?)~~
- ~~napraviti gumb: edit profile koji će nuditi sve opcije navedene gore~~
- urediti button upload image, probati napraviti nekako da se napravi krug na koji će korisnik kliknuti i uploadati sliku; ako korisnik već ima sliku, makni button upload i napravi button edit picture(tu može promijeniti sliku)
- napraviti rating (ali to kad ga zaposlenici mogu rejtati pa da se prikaže prosjek ocjena) -> otom potom, ne sad

~~Ovo sve mora korisnik MORATI unijeti u svoj profil. To se sve mora spremati u bazu pod tim korisnikom (određenim), svaki korisnik ima svoje podatke.~~

## LOGIN ## 
- forgot password option (možda da mu se reset posalje na email?)

## REGISTER ##

## navbar ##
- napraviti navbar (home (logo), my profile, job search, about, sign out) - ovo će svugdje biti isto

## JOB SEARCH ##
- search bar, filter option
- filter opcije: spol, iskustvo, razina engleskog jezika, vozačka dozvola(bool), lokacija, general experience, qualifications
- kad se klikne na rezultat pretraživanja -> vodi na novu componentu (posao)
- izbaci ponude posla kao kartice (naziv, opis kratki) i onda da se klikne na to vodi se na novu componentu
