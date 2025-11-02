# 🌐 Adding Custom Domain to Firebase Hosting

## Overview

After your site is deployed to Firebase Hosting, you can add a custom domain (like `www.yourdomain.com` or `yourdomain.com`) instead of using the default `skapl-prod.web.app` URL.

## ✅ Prerequisites

- ✅ Site already deployed to Firebase Hosting
- ✅ Domain name purchased (from any registrar like GoDaddy, Namecheap, etc.)
- ✅ Access to your domain's DNS settings

---

## 📋 Step-by-Step Guide

### Step 1: Add Domain in Firebase Console

1. **Go to Firebase Hosting**:
   ```
   https://console.firebase.google.com/project/skapl-prod/hosting
   ```

2. **Click "Add custom domain"** button (top right)

3. **Enter your domain**:
   - Enter: `yourdomain.com` or `www.yourdomain.com`
   - Click "Continue"

4. **Choose verification method**:
   - Firebase will show you DNS records to add
   - **Option A**: Add TXT record (recommended, easier)
   - **Option B**: Upload HTML file (if TXT doesn't work)

### Step 2: Add DNS Records

Firebase will show you records like:

**For TXT verification:**
```
Type: TXT
Name: @ (or leave blank, depending on your DNS provider)
Value: firebase=skapl-prod-xxxxx
```

**After verification, add A records:**
```
Type: A
Name: @
Value: 151.101.1.195
Value: 151.101.65.195
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: skapl-prod.web.app
```

### Step 3: Wait for DNS Propagation

1. **Wait 24-48 hours** for DNS changes to propagate globally
2. **Check DNS propagation**: Use https://www.whatsmydns.net/
3. **Verify in Firebase Console**: Status will change to "Connected"

### Step 4: SSL Certificate (Automatic)

- ✅ Firebase automatically provisions **free SSL certificates** via Let's Encrypt
- ✅ Takes **10-60 minutes** after DNS is verified
- ✅ Certificate is automatically renewed
- ✅ No action needed from you!

---

## 🔧 DNS Provider Specific Instructions

### **GoDaddy**

1. Go to: GoDaddy → My Products → DNS
2. Add records as shown in Firebase Console
3. Save changes
4. Wait for propagation

### **Namecheap**

1. Go to: Namecheap → Domain List → Manage → Advanced DNS
2. Add records as shown in Firebase Console
3. Save changes
4. Wait for propagation

### **Cloudflare**

1. Go to: Cloudflare Dashboard → DNS
2. Add records (make sure proxy is OFF for A records initially)
3. After SSL is set up, you can enable proxy
4. **Note**: Cloudflare has special considerations (see below)

### **Other Providers**

Most DNS providers work the same way:
1. Find DNS Management / DNS Records section
2. Add the records Firebase shows you
3. Save and wait

---

## 🔒 Cloudflare Special Considerations

If you use Cloudflare:

### Option 1: Use Cloudflare Proxy (Recommended for Security)

1. **Add A records** in Cloudflare
2. **Enable "Proxy"** (orange cloud icon) for security
3. **Firebase SSL still works** with Cloudflare proxy
4. **Benefits**: DDoS protection, CDN, better security

### Option 2: DNS Only (If You Want Direct Firebase Connection)

1. Add A records in Cloudflare
2. **Disable proxy** (gray cloud) - DNS only mode
3. Direct connection to Firebase

**Recommendation**: Use Option 1 (Cloudflare proxy) for better security and performance.

---

## 🔄 Multiple Domains (www + root)

If you want both `yourdomain.com` AND `www.yourdomain.com`:

### Method 1: Add Both Separately

1. Add `yourdomain.com` first
2. Wait for it to be connected
3. Add `www.yourdomain.com` as a second domain
4. Configure DNS for both

### Method 2: Redirect One to the Other

1. Add one domain (e.g., `yourdomain.com`)
2. In Firebase Console → Hosting → Your domain → Settings
3. Enable "Redirect www to root" (or vice versa)

---

## ✅ Verification Checklist

After adding domain:

- [ ] DNS records added correctly
- [ ] DNS propagated (check with whatsmydns.net)
- [ ] Domain shows "Connected" in Firebase Console
- [ ] SSL certificate issued (shows lock icon)
- [ ] Site loads at custom domain
- [ ] Forms work (test contact/career forms)
- [ ] HTTPS redirect works (http → https)

---

## 🔍 Verify Everything Works

### Test Your Custom Domain

1. **Visit your domain**: `https://yourdomain.com`
2. **Test forms**: Submit contact and career forms
3. **Check console**: No CORS or Firebase errors
4. **Test HTTPS**: Make sure SSL certificate is active (green lock)

### Common Issues

| Issue | Solution |
|-------|----------|
| Domain not resolving | Check DNS records are correct, wait for propagation |
| SSL certificate pending | Wait up to 1 hour after DNS is verified |
| Site loads but forms fail | Check Firebase config includes custom domain |
| Mixed content warnings | Ensure all resources use HTTPS |

---

## 🎯 Update Turnstile for Custom Domain

**Important**: After adding custom domain, update Turnstile settings:

1. **Go to Cloudflare Turnstile**:
   ```
   https://dash.cloudflare.com/ → Turnstile
   ```

2. **Edit your sites** (contact and career):
   - Click on each site
   - Click "Edit"
   - **Add your custom domain** to the domain list
   - Save

3. **This ensures Turnstile works** on your custom domain!

---

## 🔐 Security Headers (Already Configured)

Your `firebase.json` already has security headers configured. These work with custom domains automatically:

- ✅ Cache-Control headers
- ✅ CORS headers for API routes
- ✅ Clean URLs enabled

---

## 📊 Monitoring Your Custom Domain

### Firebase Console

Monitor at: https://console.firebase.google.com/project/skapl-prod/hosting

**You'll see:**
- Domain status (Connected/Pending)
- SSL certificate status
- Traffic analytics
- Deployment history

### DNS Health Checks

Use these tools:
- https://www.whatsmydns.net/ - Check DNS propagation
- https://dnschecker.org/ - Verify DNS records globally
- https://www.ssllabs.com/ssltest/ - Test SSL certificate

---

## 🚀 After Domain is Connected

### 1. Update Any Hardcoded URLs

If you have hardcoded Firebase URLs anywhere:
- Update to use your custom domain
- Check `CONTENT.json` or any config files
- Update social media links, email signatures, etc.

### 2. Update Social Media Metadata

If you use Open Graph tags or Twitter cards:
- Update `og:url` to use custom domain
- Update `twitter:url` if used

### 3. Submit to Search Engines

- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters
- Add sitemap if you have one

---

## ⚙️ Firebase Configuration (No Changes Needed!)

**Good News**: Your `firebase.json` and workflow files **don't need changes** for custom domains!

- ✅ Firebase handles domain mapping automatically
- ✅ SSL certificates are automatic
- ✅ Security rules apply to custom domain
- ✅ Functions work with custom domain

**The only thing** you might want to do is update Turnstile to include your custom domain (see above).

---

## 🔄 Domain Management

### View All Domains

Firebase Console → Hosting → See all your domains listed

### Remove a Domain

1. Firebase Console → Hosting
2. Click on the domain
3. Settings → Delete domain
4. Remove DNS records from your registrar

### Update DNS Records

If Firebase asks you to update DNS:
1. Go to your domain registrar
2. Update the records Firebase shows
3. Wait for propagation

---

## 📝 Quick Reference

### Firebase Console Links

- **Hosting Dashboard**: https://console.firebase.google.com/project/skapl-prod/hosting
- **Domain Settings**: https://console.firebase.google.com/project/skapl-prod/hosting/main
- **Custom Domains**: https://console.firebase.google.com/project/skapl-prod/hosting/main/domains

### Useful DNS Tools

- **DNS Checker**: https://dnschecker.org/
- **What's My DNS**: https://www.whatsmydns.net/
- **SSL Labs**: https://www.ssllabs.com/ssltest/

### Common Domain Configurations

```
yourdomain.com        → A records (Firebase IPs)
www.yourdomain.com    → CNAME to skapl-prod.web.app
```

---

## 🆘 Troubleshooting

### "Domain verification failed"

**Solutions:**
- Check DNS records are exactly as Firebase shows
- Wait longer (can take up to 48 hours)
- Try HTML file verification method instead

### "SSL certificate pending"

**Solutions:**
- Wait 1-2 hours after domain is verified
- Check DNS records are correct
- Make sure domain is accessible

### "Site loads but forms don't work"

**Solutions:**
- Check Turnstile domains include custom domain
- Verify Firebase config variables are correct
- Check browser console for errors

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Domain added in Firebase Console
- [ ] DNS records added correctly
- [ ] Domain status: "Connected"
- [ ] SSL certificate: Active (green lock)
- [ ] Site loads at custom domain
- [ ] HTTPS redirect works
- [ ] Contact form works
- [ ] Career form works
- [ ] Turnstile domains updated
- [ ] No console errors

---

## 🎉 That's It!

Once your custom domain is connected:

✅ Your site will be live at `https://yourdomain.com`  
✅ Free SSL certificate (automatic)  
✅ All forms will work  
✅ Same Firebase features, just custom domain  

**No code changes needed!** The custom domain just maps to your existing Firebase Hosting. 🚀

---

## Need Help?

- **Firebase Hosting Docs**: https://firebase.google.com/docs/hosting/custom-domain
- **DNS Issues**: Contact your domain registrar support
- **SSL Issues**: Usually resolves automatically, wait 24 hours max

