# Storage & Static Serving

## Storage

There’s an folder named **“uploads”** in root:

- **/uploads** → Post cover photos are here
- **/uploads/images_of_posts** → Post content images are here
- **/uploads/images_of_notes** → Note content images are here
- **/uploads/user_avatars** → User profile photos are here

## Static Serving

App makes static serving with this code:

```tsx
// Static serve /uploads for blog's images, files.
// Path: /api/static
app.use(apiUrls.static, express.static(path.join(__dirname, '../uploads')))
```