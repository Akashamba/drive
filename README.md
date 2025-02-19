# Drive Tutorial

## TODO

- [ ] Fix sign up flow and make it look decent

- [ ] Delete a folder (Theo tip: Make sure you fetch all of the folders that have it as a parent, and their children too)

- [ ] Delete a user (and all their files)

- [ ] Store file types in db

- [ ] File Key issue: Store file key in db to delete from uploadthing properly

- [ ] Folder creations (Theo tip: Make a server action that takes a name and parentId, and creates a folder with that name and parentId (don't forget to set the ownerId).)

- [ ] File and Folder Rename

- [ ] Storage limit per user (with indicator)

- [ ] Access control (Theo tip: Check if user is owner before showing the folder page. Handle case where user isn't signed in but clicks a link to a folder/file)

- [ ] Toasts for all events (including file upload and delete)

  - [ ] Gray out a row while it's being deleted

- [ ] Make a "file view" page (open and render files within the app rather than using browser)
