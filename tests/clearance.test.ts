// CSV parser + sheet mapping for the Clearance & Floor Models page (lib/clearance.ts). Runs on Node's built-in test
// runner (Node 24 strips the types itself): `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, parseDate, parseNumber, parsePhotos, photoUrl, rowsToListings, isVisible } from '../lib/clearance.ts';

const HEADER = 'location,id,category,brand,model,size,comfort,construction,condition,new_in_box,retail,sale,qty,listed,photos,description,status,sold_date';
const NOW = new Date('2026-11-12T18:00:00Z').getTime();

test('parseCsv: quoted commas, doubled quotes, CRLF, BOM, blank lines', () => {
  const rows = parseCsv('﻿a,b,c\r\n1,"two, with comma","she said ""hi"""\r\n\r\n4,5,6\n');
  assert.deepEqual(rows, [['a', 'b', 'c'], ['1', 'two, with comma', 'she said "hi"'], ['4', '5', '6']]);
});

test('parseCsv: newlines inside a quoted field stay inside the field', () => {
  const rows = parseCsv('id,description\nMCA-1,"line one\nline two, still one cell"\nMCA-2,plain');
  assert.equal(rows.length, 3);
  assert.equal(rows[1][1], 'line one\nline two, still one cell');
  assert.deepEqual(rows[2], ['MCA-2', 'plain']);
});

test('photoUrl / parsePhotos: Drive share links convert, https passes, junk is dropped, | or whitespace separate', () => {
  assert.equal(photoUrl('https://drive.google.com/file/d/1AbC_dE-f9/view?usp=sharing'), 'https://lh3.googleusercontent.com/d/1AbC_dE-f9');
  assert.equal(photoUrl('https://drive.google.com/open?id=XyZ123'), 'https://lh3.googleusercontent.com/d/XyZ123');
  assert.equal(photoUrl('https://drive.google.com/uc?export=view&id=QwE456'), 'https://lh3.googleusercontent.com/d/QwE456');
  assert.equal(photoUrl('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
  assert.equal(photoUrl('http://insecure.example.com/a.jpg'), null);
  assert.equal(photoUrl('not a url'), null);
  assert.deepEqual(parsePhotos('https://a.example/1.jpg | https://drive.google.com/file/d/ID1/view\nhttps://a.example/3.jpg'), ['https://a.example/1.jpg', 'https://lh3.googleusercontent.com/d/ID1', 'https://a.example/3.jpg']);
  assert.deepEqual(parsePhotos(''), []);
});

test('parseDate: YYYY-MM-DD and MM/DD/YYYY (also M/D/YYYY); anything else null', () => {
  assert.equal(parseDate('2026-11-08'), '2026-11-08');
  assert.equal(parseDate('11/08/2026'), '2026-11-08');
  assert.equal(parseDate('1/9/2026'), '2026-01-09');
  assert.equal(parseDate('2026-11-08T12:00:00'), '2026-11-08');
  assert.equal(parseDate('Nov 8 2026'), null);
  assert.equal(parseDate(''), null);
});

test('parseNumber: $ and , stripped; blank / text → null', () => {
  assert.equal(parseNumber('$4,299'), 4299);
  assert.equal(parseNumber(' 1399.50 '), 1399.5);
  assert.equal(parseNumber(''), null);
  assert.equal(parseNumber('call'), null);
});

test('rowsToListings: location filter (case-insensitive, trimmed), mapping, yes/no, defaults', () => {
  const csv = [HEADER,
    'McAllen,MCA-1101,mattress,Tempur-Pedic,TEMPUR-ProAdapt Medium Hybrid,Queen,Medium,Hybrid,Floor model,no,"$4,299","2,799",1,2026-11-08,https://drive.google.com/file/d/ABC/view,"Showroom model, excellent shape.",,',
    ' mcallen ,MCA-1102,Mattress,Sealy,Posturepedic Plus Firm,King,Firm,Hybrid,Clearance – new in box,YES,2199,1399,,11/10/2026,,"Brand-new, never displayed.",sold,11/11/2026',
    'Brownsville,BRV-2001,base,Sealy,Ease 4.0,Queen,,Head + foot lift,Open box,no,1299,749,1,2026-10-30,,Opened and returned unused.,available,',
  ].join('\n');
  const { listings, skipped } = rowsToListings(parseCsv(csv), 'McAllen', NOW);
  assert.deepEqual(skipped, []);
  assert.deepEqual(listings.map((l) => l.id), ['MCA-1101', 'MCA-1102']);
  const [a, b] = listings;
  assert.equal(a.category, 'mattress'); assert.equal(a.newInBox, false); assert.equal(a.retail, 4299); assert.equal(a.sale, 2799); assert.equal(a.qty, 1);
  assert.equal(a.listed, '2026-11-08'); assert.deepEqual(a.photos, ['https://lh3.googleusercontent.com/d/ABC']); assert.equal(a.status, 'available'); assert.equal(a.soldDate, undefined);
  assert.equal(a.description, 'Showroom model, excellent shape.');
  assert.equal(b.category, 'mattress'); assert.equal(b.newInBox, true); assert.equal(b.qty, 1, 'blank qty defaults to 1'); assert.equal(b.listed, '2026-11-10');
  assert.equal(b.status, 'sold'); assert.equal(b.soldDate, '2026-11-11'); assert.deepEqual(b.photos, [], 'empty photos → the kit placeholder');
  assert.equal(b.comfort, 'Firm');
});

test('rowsToListings: rows missing id/brand/model/sale/retail are skipped and reported with the line number', () => {
  const csv = [HEADER,
    'McAllen,,mattress,Sealy,Model,Queen,,,Floor model,no,1000,700,1,2026-11-01,,,,',
    'McAllen,MCA-3,mattress,Sealy,Model,Queen,,,Floor model,no,,700,1,2026-11-01,,,,',
    'McAllen,MCA-4,mattress,Sealy,Model,Queen,,,Floor model,no,1000,,1,2026-11-01,,,,',
    'McAllen,MCA-5,chair,Infinity,Riage X3,,,,"Floor model",no,5999,3999,1,2026-11-01,,,hiden,',
  ].join('\n');
  const { listings, skipped } = rowsToListings(parseCsv(csv), 'McAllen', NOW);
  assert.deepEqual(skipped.map((s) => [s.line, s.reason]), [[2, 'missing id'], [3, 'missing retail'], [4, 'missing sale'], [5, 'unknown status "hiden" (treated as hidden)']]);
  assert.deepEqual(listings.map((l) => [l.id, l.status]), [['MCA-5', 'hidden']]);
});

test('rowsToListings: header order is free and names are matched case-insensitively; multiline description survives', () => {
  const csv = 'ID,Location,Brand,Model,Retail,Sale,Description\nMCA-9,McAllen,Serta,iComfort,1899,1099,"Gel memory foam.\nSmall mark on the side."';
  const { listings } = rowsToListings(parseCsv(csv), 'McAllen', NOW);
  assert.equal(listings.length, 1);
  assert.equal(listings[0].description, 'Gel memory foam.\nSmall mark on the side.');
  assert.equal(listings[0].category, 'other'); assert.equal(listings[0].size, ''); assert.equal(listings[0].listed, '2026-11-12', 'missing listed defaults to today');
});

test("isVisible: the kit's windows — sold shows for soldVisibleDays, stale listings auto-hide, hidden never shows", () => {
  const base = { id: 'X', category: 'mattress' as const, brand: 'B', model: 'M', size: 'Queen', condition: 'Floor model', newInBox: false, retail: 100, sale: 50, qty: 1, listed: '2026-11-01', photos: [], description: '', status: 'available' as const };
  assert.equal(isVisible(base, NOW), true);
  assert.equal(isVisible({ ...base, listed: '2026-10-01' }, NOW), false, 'older than autoExpireDays');
  assert.equal(isVisible({ ...base, status: 'sold', soldDate: '2026-11-09' }, NOW), true, 'sold 3 days ago → SOLD ribbon');
  assert.equal(isVisible({ ...base, status: 'sold', soldDate: '2026-11-01' }, NOW), false, 'sold 11 days ago → gone');
  assert.equal(isVisible({ ...base, status: 'hidden' }, NOW), false);
});
