# Pixiv Powerful Viewer

This app allows you to view and search collection saved by [Powerful Pixiv Downloader](https://chromewebstore.google.com/detail/powerful-pixiv-downloader/dkndmhgdcmjdmkdonmbgjpijejdcilfh) browser extension locally.

## Download

[Go to _Releases_ page](https://github.com/fekoneko/pixiv-powerful-viewer/releases)

## App features

- Search by title, tags, description and author
- Automatic romaji-to-kana conversion in the search field
- All information parsed from metadata files generated by [Powerful Pixiv Downloader](https://chromewebstore.google.com/detail/powerful-pixiv-downloader/dkndmhgdcmjdmkdonmbgjpijejdcilfh)
- You can add works to favorites to rewatch them later
- It is possible to load several collections and switch between them on the fly
- Convenient navigation with keyboard. Every feature is available without the need to touch a mouse
- And, of course, there is a light and a dark theme

> [!NOTE]
> Novels are not yet supported. I think about adding the support in the future

## Creating collection

> [!IMPORTANT]
> Pixiv Powerful Viewer parses specific folder structure inside collections. Follow the steps below to configure [Powerful Pixiv Downloader](https://chromewebstore.google.com/detail/powerful-pixiv-downloader/dkndmhgdcmjdmkdonmbgjpijejdcilfh) extension properly.

- You can use any folder structure as long as every work has _it's own folder with metadata file and all the assets directly in it_
- If metadata file wasn't found, program assumes folder name to be _the title of the work_ and its parent folder to represent _the author's name_
- Every image should have its page number in parentheses at the end of the file name
- Or you can just paste this _"Naming rule"_ in the _Download_ tab of the extension:
  ```
  {page_title}/{user} ({user_id})/{title} ({id_num})/{title} ({p_num})
  ```
- Make sure to **turn off** the option _"Save the R-18(G) works in the designated folder"_
- **Turn off** the option _"Do not create a folder when there is only one crawl result"_
- In the _More_ tab select _"Show advanced settings"_ and check **all types** of works under _"Save the metadata of the work"_ option
- Also, I think it's better to _"Save the ugoira work as"_ **GIF**

## Hotkeys

- `↑` / `↓` or `W` / `S` - select previous / next work
- `←` / `→` or `A` / `D` - navigate pages within a work
- `Enter` - add selected work to favorites
- `Ctrl + Enter` - view favorite works
- `F` - toggle fullscreen mode
- `Space` - open work details (use `Ctr + ↑ / ↓` or `Ctrl + W / S` to scroll the menu)
- `/` or `\` - go to search field (`Esc` to exit)
- `` Ctrl + ` `` - toggle romaji-to-kana conversion
- `Ctrl + O` - open collection
- `Ctrl + Tab` - focus on _recent collections_ button

## Screenshots

> [!NOTE]
> On the screenshots below I used the works of [あおいとり](https://www.pixiv.net/users/1688603) for demonstration.
> I didn't really ask for permission, but they're the great artist, I encourage you to [check out their work](https://www.pixiv.net/users/1688603) :)

> [!NOTE]
> Also these screenshots were taken on the _Electron_ version of the app. Sinse then I decided to move it to _Tauri_, but it looks mostly the same still

![image](https://github.com/fekoneko/pixiv-powerful-viewer/assets/55813967/f90a36f0-162d-419d-936d-ccf0a970b090)

![image](https://github.com/fekoneko/pixiv-powerful-viewer/assets/55813967/fb6891e6-7ce7-47e8-acb6-a6d4f1b82aaf)
