# Typedoc

There is a **“doc”** command in package.json. (npx typedoc --options typedoc.json) It builds a code documentation with typedoc.json file to root folder named “docs” folder.

More Info about Typedoc: https://typedoc.org/

### Sample Using

```tsx
/**
 * Creates a guest bookmark with related post and guest.
 * @param createGuestBookmarkDTO CreateGuestBookmarkDTO
 * @throws Error
 * @returns Promise < GuestBookmarkDTO >
 */
async createGuestBookmark(
    createGuestBookmarkDTO: CreateGuestBookmarkDTO): Promise<GuestBookmarkDTO>
{
    const result = await prismaClient.bookmark.create({
        data: {
            role: Role.GUEST,
            postId: createGuestBookmarkDTO.postId,
            guestId: createGuestBookmarkDTO.guestId,
            userId: undefined,
        }
    })

    return GuestBookmarkDTO.fromDB(result)
}
```

![Screenshot 2025-02-06 at 14.48.09.png](Typedoc%2013ca4b25fe518003986aeb7f095a0aeb/Screenshot_2025-02-06_at_14.48.09.png)