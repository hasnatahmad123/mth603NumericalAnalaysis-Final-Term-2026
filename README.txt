MTH603 STUDY SITE — HOW TO PUT THIS ON HOSTINGER
=================================================

WHAT YOU HAVE
  index.html    the whole study guide
  styles.css    the design
  app.js        search, quiz, progress, dark mode
  README.txt    this file

All three files must stay TOGETHER in the same folder.
Do not rename index.html — the server looks for that exact name.


UPLOADING (about 3 minutes)
---------------------------
1. Log in to Hostinger and open hPanel.
2. Go to:  Websites  ->  your site  ->  Dashboard  ->  File Manager
3. Open the folder called  public_html
4. Delete anything already inside it (usually a default index.html).
5. Click Upload, and upload all three files:
     index.html, styles.css, app.js
6. Visit your domain. Done.

FASTER OPTION: upload mth603-site.zip instead, then right-click it in
File Manager and choose "Extract". Make sure the three files end up
directly inside public_html, not inside an extra folder.
If they landed in public_html/site/, just move them up one level.


CHECKING IT WORKED
------------------
Open your domain on your phone. You should see a dark navy header
reading "MTH603 Revision" with a search box under it.

If you see plain unstyled text, styles.css did not upload, or it is
sitting in a different folder from index.html.


USING IT ON YOUR PHONE
----------------------
  Aa button        makes the text bigger or smaller
  Moon button      dark mode
  Search box       type "Simpson", "k2", "radians" to jump straight there
  Contents         bottom-left, jumps to any section
  Mark studied     end of each section, tracks the progress bar
  Show first step  in worked examples, reveals the solution one line
                   at a time instead of all at once

Your progress, dark mode and text size are saved on your phone.
Close the browser and come back — nothing is lost.


ADD IT TO YOUR HOME SCREEN (recommended)
----------------------------------------
  Android/Chrome:  menu (three dots) -> Add to Home screen
  iPhone/Safari:   share button -> Add to Home Screen

It then opens like an app.


OFFLINE USE
-----------
The site works offline once loaded, except the fonts, which come from
Google. Without internet it falls back to your phone's built-in fonts —
everything is still perfectly readable, it just looks slightly different.


NO WEB HOSTING? NO PROBLEM
--------------------------
You do not actually need Hostinger to study from this. Copy the three
files into any folder on your phone and open index.html with Chrome
(Files app -> tap index.html -> Open with Chrome). It works the same.
