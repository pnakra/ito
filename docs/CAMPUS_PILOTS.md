# Campus bystander pilot links

A campus pilot can include its own support and reporting pages in the bystander beta URL. No school contacts are built into ito.

## Parameters

- `campus`: display name, up to 80 characters
- `support_url`: campus support or advocacy page
- `title_ix_url`: Title IX information page
- `report_url`: campus reporting or anonymous-tip page

All three links must use HTTPS. Invalid or non-HTTPS links are ignored. The links persist in session storage for that tab as the visitor moves through the product. They are not sent to ito as part of a narrative.

Example with placeholder URLs:

```text
/bystanderbeta?campus=Example%20College&support_url=https%3A%2F%2Fexample.edu%2Fsupport&title_ix_url=https%3A%2F%2Fexample.edu%2Ftitle-ix&report_url=https%3A%2F%2Fexample.edu%2Freport
```

Replace the example name and URLs with pages owned by the campus. Check what each office keeps confidential, what it must report, and whether a tip form is actually anonymous before distributing the link. The product labels these as supplied pilot links, not verified ito recommendations.

When a witness says the targeted person asked them not to report or share, the product hides the Title IX and reporting links from the witness outcome screen. Campus support remains available. Immediate emergencies still use 911.

## Aggregate pilot snapshot

The internal growth dashboard shows:

- Confidence before and after, using paired answers only
- Selected witness outcome / intervention type
- Practice completions and unique completing sessions

The growth dashboard's session query explicitly excludes narrative text. The practice-completion query selects only session IDs and scenario IDs, not chat text or practice scores. Practice scores remain on the visitor's device.
