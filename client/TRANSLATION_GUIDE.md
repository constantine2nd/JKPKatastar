# Translation System Guide

## Overview

The JKP Katastar application uses **i18next** with **react-i18next** for internationalization (i18n). The system currently supports three languages:
- **Serbian (sr)** - Default language and source of truth
- **Hungarian (hu)** - Secondary language
- **English (en)** - Recently added

## Current Status

✅ **Completed:**
- Fixed and standardized all Serbian translations (source of truth)
- Corrected Hungarian translations (removed incorrect Maori translations)
- Added complete English translation support
- Restructured all translation files using nested patterns
- Added English language option to the UI language selector
- Created backward compatibility mapping for existing code

## File Structure

```
client/public/locales/
├── sr/
│   └── translation.json    # Serbian (primary)
├── hu/
│   └── translation.json    # Hungarian
└── en/
    └── translation.json    # English
```

## Translation File Structure

All translation files now use a consistent nested structure for better organization:

```json
{
  "client": {
    "your-website": "Your Internet Portal",
    "err-field-required": "The field is required"
  },
  "grave": {
    "title": "Grave",
    "add": "Add Grave",
    "add-contract-date": "Enter contract expiration date"
  },
  "menu": {
    "view-deceased": "View Deceased",
    "search-deceased": "Search Deceased"
  },
  "form": {
    "name": "Name",
    "email": "Email"
  },
  "actions": {
    "edit": "Edit",
    "delete": "Delete"
  }
}
```

## Using Translations in Components

### Basic Usage

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('grave.title')}</h1>
      <button>{t('actions.edit')}</button>
    </div>
  );
}
```

### Language Switching

The language selector is available in the Header component:
- **SR** - Serbian
- **HU** - Hungarian  
- **EN** - English

Language preference is automatically saved in localStorage.

## Migration from Old Structure

A compatibility mapping exists in `utils/translationMapping.js` that maps old flat keys to new nested keys:

```javascript
// Old way (still works due to backward compatibility)
t("Create New User") // → maps to "user.create-new"

// New way (recommended)
t("user.create-new")
```

## Translation Categories

### 1. Client (`client.*`)
- General application messages
- Landing page content
- Error messages

### 2. Domain Objects
- `cemetery.*` - Cemetery-related translations
- `grave.*` - Grave-related translations  
- `deceased.*` - Deceased person translations
- `user.*` - User management translations
- `payer.*` - Payer-related translations

### 3. UI Components
- `form.*` - Form fields and validation
- `actions.*` - Button labels and actions
- `menu.*` - Navigation menu items
- `auth.*` - Authentication screens

### 4. System
- `server.*` - Server error messages
- `status.*` - Status indicators
- `roles.*` - User roles
- `dates.*` - Date-related fields
- `location.*` - Geographic coordinates

## Best Practices

### 1. **Use Nested Keys**
```jsx
// ✅ Good
t('grave.create-new')

// ❌ Avoid
t('Create New Grave')
```

### 2. **Keep Keys Descriptive**
```jsx
// ✅ Good
t('user.delete-confirmation')

// ❌ Avoid  
t('confirm')
```

### 3. **Group Related Translations**
```jsx
// ✅ Good - All form fields together
t('form.name')
t('form.email')
t('form.phone')
```

### 4. **Use Consistent Naming**
- Use kebab-case for keys: `grave-request`, `user-management`
- Use descriptive suffixes: `-required`, `-mandatory`, `-confirmation`

## Adding New Translations

### 1. Add to Serbian file first (source of truth)
```json
// sr/translation.json
{
  "reports": {
    "title": "Izveštaji",
    "generate": "Generiši izveštaj"
  }
}
```

### 2. Add to Hungarian file
```json
// hu/translation.json  
{
  "reports": {
    "title": "Jelentések",
    "generate": "Jelentés generálása"
  }
}
```

### 3. Add to English file
```json
// en/translation.json
{
  "reports": {
    "title": "Reports", 
    "generate": "Generate Report"
  }
}
```

## Alternative Approaches

### Approach 1: Automatic Translation Generation
**Pros:**
- Fast implementation for missing translations
- Consistent formatting
- Can use translation APIs (Google Translate, DeepL)

**Cons:**
- Requires API keys and costs
- May lack context and accuracy
- Still needs manual review

**Implementation:**
```javascript
// Auto-translate missing keys using translation API
const autoTranslateKeys = async (sourceKeys, targetLang) => {
  // Use translation service API
  // Generate missing translations
  // Save to target language file
};
```

### Approach 2: Crowdsourced Translation
**Pros:**
- Higher quality translations
- Community involvement
- Cultural context awareness

**Cons:**
- Slower process
- Requires management overhead
- Quality control needed

**Tools:** Crowdin, Lokalise, Weblate

### Approach 3: Professional Translation
**Pros:**
- Highest quality
- Professional accuracy
- Legal/technical precision

**Cons:**
- Most expensive
- Longer turnaround time
- Requires ongoing maintenance

### Approach 4: Hybrid AI + Human Review
**Pros:**
- Good balance of speed and quality
- AI for bulk translation, humans for review
- Continuous improvement

**Cons:**
- Still requires human resources
- Initial setup complexity

**Recommended Implementation:**
1. Use AI translation for initial bulk translation
2. Human review for critical user-facing text
3. A/B testing for user preference
4. Continuous feedback loop

## Maintenance

### Regular Tasks
1. **Audit for missing translations** - Run script to find untranslated keys
2. **Consistency check** - Ensure all languages have same key structure  
3. **User feedback** - Collect translation quality feedback
4. **Performance monitoring** - Check translation loading performance

### Tools and Scripts
```bash
# Check for missing translations
npm run i18n:check

# Generate translation report
npm run i18n:report

# Validate translation files
npm run i18n:validate
```

## Configuration

### i18n Configuration (`src/i18n.js`)
```javascript
import i18n from "i18next";
import Backend from "i18next-xhr-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: "sr",              // Default language
    fallbackLng: "sr",      // Fallback language
    interpolation: {
      escapeValue: false,   // React already escapes
    },
  });
```

### Language Detection
- Manual selection via header dropdown
- localStorage persistence
- Fallback to Serbian if preference not found

## Troubleshooting

### Common Issues

1. **Translation not showing**
   - Check if key exists in translation file
   - Verify nested structure is correct
   - Check for typos in key names

2. **Wrong language loading**
   - Clear localStorage: `localStorage.removeItem('selected-language')`
   - Check i18n configuration
   - Verify language files exist

3. **Missing translations**
   - Check all language files have the same keys
   - Use backward compatibility mapping if needed
   - Add missing keys to all language files

### Debug Mode
```javascript
// Add to i18n configuration for debugging
debug: process.env.NODE_ENV === 'development'
```

## Performance Optimization

### Lazy Loading
```javascript
// Load translations on demand
const loadNamespaceTranslations = async (namespace) => {
  await i18n.loadNamespaces(namespace);
};
```

### Bundle Size
- Consider splitting translations by feature
- Use dynamic imports for less common languages
- Minimize translation file sizes

## Future Enhancements

1. **Translation Management UI** - Admin interface to manage translations
2. **Real-time Updates** - Hot-reload translations without app restart
3. **Pluralization** - Handle singular/plural forms properly
4. **Date/Number Formatting** - Locale-specific formatting
5. **RTL Support** - Right-to-left language support if needed
6. **Translation Analytics** - Track which translations are used most

## Contributing

When adding new features:
1. Add Serbian translations first
2. Use nested key structure
3. Update all language files
4. Test language switching
5. Update this documentation if needed

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Translation File Validator](https://jsonlint.com/)
- [Serbian Language Guide](https://sr.wikipedia.org/wiki/)
- [Hungarian Language Guide](https://hu.wikipedia.org/wiki/)