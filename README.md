Add bottom navigation buttons → enable navigation between features

                                 ⬇️

Handwritten prescription → printed prescription (first usable version)

                                 ⬇️

Medicine shop map → filter highest → lowest discount → filter nearest → farthest





ui fixed -
- after upload successful no message to declare upload was successful.
- report display page has very bad ui.
- the uploading logic needs to be improved to allow multiple upload and pdf upload.
- make a separate profile access page so that users can access their own data without any scanning.

what is the utility of the scanner. if for some reason i cannot log into my account i can still access my records if the scanner is available.


date extraction pla:-
User selects image
↓
Frontend uploads image (temporary)
↓
Backend runs OCR + date extraction
↓
Backend returns:
  - suggestedDate
  - confidenceScore
↓
Frontend:
  - autofills date field
  - highlights it
  - allows edit
↓
User taps “Confirm & Save”
↓
Final submit (file + verified date)


file wise flow

patient.route.js
   ↓
patient.controller.js
   ↓
services/
   ├── imageDownloader.service.js
   ├── imagePreprocess.service.js
   ├── ocr.service.js
   ├── dateExtractor.service.js
   └── dateConfidence.service.js
   ↓
response to frontend


study about the optimization time complexity for sorting used.
the time taken to fetch data from db optimized or not

bug-
* user2@email.com is not a valid email but still the login worked although while retrieving data console printed patient not found
* for update profile page add drop down to - 1. gender 2. blood group
* ui fix for reportpage display the ui is terrible
* adjust medical record display to this ui ![alt text](image.png) 
* add a delete button to delete any record
* report_name and prescription_name is mandatory. so jodi user name na enter kore by default report ba prescription naam chole jabe
* mend the ui properly(upload prescription and report buttons)
* buttons at the bottom to navigate to different features

have to do-
* make a proper architecture
* ui is vry bad make it consistent and better.

