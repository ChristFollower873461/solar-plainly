# Consumer Recruitment And Contract Sourcing

Status: first outreach live on August 9, 2026.

This is the operating plan for reaching solar shoppers and owners directly. It
supports the broader evidence plan in [SOURCING_PLAN.md](SOURCING_PLAN.md); it
is not a homeowner lead list and must never become one.

## Decision

Use four channels in this order:

1. Ask consumer organizations to circulate an opt-in invitation.
2. Recruit screened, compensated participants through a research panel.
3. Post only in owner communities that permit research or promotion.
4. Test postal invitations in high-solar areas without appending names, emails,
   phone numbers, or consumer profiles.

Do not scrape solar owners, cold-email or text people found in permit records,
reverse-identify households from aerial imagery, buy enriched homeowner data,
or privately solicit people who are asking for help in an online forum.

The public screener is:

<https://docs.google.com/forms/d/e/1FAIpQLScve57k2bzR-jpbbjM_sbXVQz2EhGf6ktsiR2VcYul788cK5g/viewform>

It asks for no document, exact address, account number, phone number, income,
or payment information. New-response notifications go to the project owner's
Workspace inbox. The form is open to anyone with the link and does not require
a Google sign-in.

## What "Find Solar Owners" Means

### Acceptable

- Use installation data aggregated to ZIP, city, county, or carrier route to
  choose where to advertise or mail.
- Ask an organization to share an invitation with its members while keeping
  its member list private.
- Use a research platform whose participants opted in to recruitment.
- Ask a forum moderator for permission and follow the forum's posting rules.
- If a municipality publishes completed solar-installation addresses, mail a
  generic invitation addressed to "Resident" without using or retaining an
  owner's name.

### Not acceptable

- Publish or commit a household address list.
- Use permit-owner names even when the source exposes them.
- Append property-owner, voter, email, mobile-phone, income, credit, or social
  profile data.
- Cold-call, cold-text, or cold-email a household identified through a permit.
- Contact people individually because they posted about a dispute, loan, or
  vulnerable financial situation.
- Describe a ZIP-level estimate as proof that a particular home has solar.

Any temporary postal list stays outside Git, is limited to the approved vendor
and campaign operator, includes a suppression list for opt-outs, and is deleted
within 90 days after the campaign.

## Where Solar Ownership Is Concentrated

### National geography source

Berkeley Lab's [U.S. Distributed Solar and Storage Data](https://emp.lbl.gov/tracking-the-sun/)
contains project-level public data through 2024. Its September 2025 user guide
documents residential customer segments, installation date, ZIP, city, state,
third-party ownership, equipment, installer, and system identifiers. The
public file has ZIP-level location but not street address.

For the first targeting pass, the downloaded public CSV was filtered to
`RES`, `RES_SF`, and `RES_MF`, aggregated by five-digit ZIP, and compared with
2024 ACS five-year owner-occupied household estimates from
[Census Reporter](https://censusreporter.org/). Only ZIPs among the 500 highest
raw system counts and with at least 1,000 estimated owner-occupied households
were ranked.

This is a campaign-selection proxy, not an adoption rate. Berkeley Lab coverage
varies by state and provider, rows can include expansions or multiple phases,
ZIP codes and Census ZCTAs are not perfectly identical, and an installation can
change occupants.

| Initial ZIP candidate | Public-file residential rows | Installed 2018-2024 | Owner-occupied households | Rows per 1,000 owner-occupied households |
| --- | ---: | ---: | ---: | ---: |
| AZ 85396 | 6,342 | 4,183 | 13,451 | 471.5 |
| AZ 85326 | 7,827 | 4,784 | 17,734 | 441.4 |
| AZ 85387 | 3,649 | 2,728 | 8,666 | 421.1 |
| AZ 85338 | 7,654 | 4,176 | 18,447 | 414.9 |
| NJ 08046 | 3,347 | 2,316 | 8,905 | 375.9 |
| CO 80019 | 725 | 639 | 2,034 | 356.4 |
| FL 34771 | 2,263 | 2,187 | 9,829 | 230.2 |

Use these ZIPs for an EDDM or geographically targeted recruitment test only
after checking the actual route in the USPS tool. Do not infer a household list
from the table.

### Address-level public pilots

Two official municipal datasets prove that address-level recruitment can be
done without a commercial people-data broker:

- The [Town of Cary Solar Permit Applications](https://catalog.data.gov/dataset/solar-permit-applications)
  dataset is updated daily, is published under CC0, and exposed 1,998 solar
  permit applications when checked on August 9, 2026. The feed includes project
  address, status, issue date, and owner name. Use completed/occupancy records
  and project address only; discard the owner-name field.
- Cambridge's [Solar Installations](https://data.cambridgema.gov/Energy-and-the-Environment/Solar-Installations/5a85-fb2s)
  dataset identifies active PV and solar-hot-water installations and includes
  street address, building type, permit date, and coordinates. Its separate
  [Solar Installation Permits](https://data.cambridgema.gov/Inspectional-Services/Solar-Installation-Permits/whpw-w55x)
  dataset includes filed permits whether or not the system was installed, so
  the active-installations table is the better recruitment source.

Do not collect either address list until a specific postal campaign, operator,
budget, deletion date, and mail vendor are approved. A generic addressed-mail
pilot is more precise than saturation mail but should be reviewed for the local
dataset's terms and applicable solicitation rules before scaling.

For broader route mail, [USPS Every Door Direct Mail](https://www.usps.com/business/every-door-direct-mail.htm)
can select carrier routes by ZIP and Census demographics, addresses each piece
to "Postal Customer," requires no names or mailing list, and currently permits
200 to 5,000 pieces per day per ZIP for EDDM Retail. Its listed retail postage
was $0.26 per piece when checked on August 9, 2026.

## Recruitment Channels

### 1. Consumer organizations

Solar United Neighbors is an installer-neutral consumer education and advocacy
organization with national and state contacts. Solar Rights Alliance reports a
network of 150,000 California solar users and supporters.

Outreach sent August 9, 2026 from `pj@aissistedconsulting.com`:

| Organization | Recipient | Request |
| --- | --- | --- |
| Solar United Neighbors | `info@solarunitedneighbors.org` | Review and optionally circulate an opt-in invitation; no member-list transfer |
| Solar Rights Alliance | `info@solarrights.org` | Review and optionally circulate a California owner invitation; no member-list transfer |

Both messages disclose that the study is compensated product research, not
solar sales or lead generation; no contract is requested in the screener; later
document sharing would be optional, separately consented, redacted, and kept
out of the public repository.

When either organization responds positively, send the public screener plus a
short invitation they can edit. Offer an aggregate, de-identified summary of
what homeowners struggled to understand. Never ask the organization to expose
its list or identify individual members.

### 2. Paid opt-in research panel

Use a paid panel to fill missing financing, geography, language, and distress
segments rather than treating a general panel as the whole sample.

- [Prolific](https://www.prolific.com/pricing) supports custom screening and
  recommends at least $12 per hour. Its current corporate platform fee is 42.8
  percent of participant rewards, with paid screen-outs for custom screening.
- [User Interviews](https://www.userinterviews.com/pricing) currently lists
  $49 per completed B2C session before incentive.
- [Respondent](https://www.respondent.io/pricing) currently lists $40
  pay-as-you-go B2C recruiting before incentive for the moderated setting.

Recommended first paid tranche: six 45-to-60-minute sessions at $75 each,
selected only to fill gaps left by partner recruitment. Planning total:

| Option | Recruiting or platform allowance | Incentives | Planning total |
| --- | ---: | ---: | ---: |
| Prolific | about $193 before screen-outs | $450 | about $643 |
| User Interviews | $294 | $450 | $744 |
| Respondent | $240 | $450 | $690 |

These are planning calculations from public prices, not approved spending or
vendor quotes. Do not open a paid study until the incentive, session count,
payment method, and maximum budget are approved.

### 3. Owner communities

Ask permission before posting. Do not reply to unrelated owner questions with
a study link.

- `/r/solar` treats market research and affiliated links as self-promotion and
  directs them to its current Community Promotion Post. Use only that thread or
  written moderator permission.
- [Solar Panel Talk](https://www.solarpaneltalk.com/) has active financing,
  installation, equipment, and general-owner sections. Use its administrator
  contact form before posting; the forum warns that self-promotion and links
  are moderated.
- The [PVOutput community](https://forum.pvoutput.org/) is relevant for
  established owners who monitor production. Ask its moderators whether a
  compensated, no-sales research invitation is acceptable.

Moderator request:

> We are building Solar Plainly, an open-source and private-by-default tool for
> homeowners to understand solar agreements and keep system records. May we
> post one compensated research invitation for U.S. solar shoppers and owners?
> The screener asks for no contract, address, account number, or payment data.
> We will not solicit members by direct message, sell leads, or post elsewhere
> in the community without permission. We can share aggregate findings back.

Approved community post:

> Solar shoppers and owners: we are testing Solar Plainly, an open-source tool
> that helps people inspect proposal and contract terms and keep a system
> record after installation. We are recruiting for compensated 45-to-60-minute
> remote sessions. The initial three-minute screener asks for no contract,
> exact address, account number, or payment information. This is product
> research, not a quote or lead form: [screener link].

### 4. Postal pilot

Run postal outreach only after partner and paid-panel response rates are known.
Start with one of these tests, not both:

1. Precision pilot: 200 generic postcards to completed solar-installation
   addresses from one approved municipal dataset, using only the project
   address and not the owner-name field.
2. Saturation pilot: one or two residential EDDM routes in a high-solar ZIP,
   addressed to "Postal Customer."

Postcard copy:

> **Already have solar, or sorting out the paperwork?**
>
> Help test Solar Plainly, a free open-source tool for understanding solar
> agreements and keeping system records. Selected volunteers may be invited to
> a compensated remote session. No sales. No solar quotes. The three-minute
> screener asks for no contract, account number, or payment information.
>
> Scan: [QR code to screener]  |  solar-plainly GitHub Pages URL

The mailpiece must name the sender, provide the project email, disclose the
research purpose, and provide an opt-out route. Do not imply that Solar Plainly
knows the recipient's contract, finances, utility account, or system condition.
The precision-pilot version must also name the municipal dataset and say that
the project used a public installation address but did not obtain the
recipient's name, phone number, or email. EDDM pieces should instead say that
the route was selected because the surrounding ZIP has substantial solar
adoption; they must not imply that every recipient has panels.

## Screening And Selection

The live form records:

- adult/home-decision-maker eligibility;
- present solar situation;
- state or territory, but no address;
- approximate agreement year;
- cash, loan, lease, PPA, community-solar, or home-transfer status;
- whether documents still exist, without requesting them;
- preferred session language;
- willingness to test the app;
- optional willingness to discuss a separately consented redacted document;
- accessibility needs or context, with a warning not to enter sensitive data;
- name, email, and permission to be contacted.

Select for situations and coverage, not demographic profiling. The first 12
moderated sessions should cover at least:

| Situation | Minimum |
| --- | ---: |
| Comparing a proposal now | 2 |
| Solar loan | 2 |
| Lease or PPA | 2 |
| Established owner using monitoring | 2 |
| Home sale, transfer, or inherited agreement | 2 |
| Installer closure, service, or production problem | 2 |

Across the 12, include at least two Spanish-preference or bilingual households
and two people who use assistive technology or identify a relevant access need
when recruitment permits. Do not promise a session to everyone who completes
the screener.

## Consent And Document Funnel

Keep each stage separate:

1. **Screener:** no documents and no exact address.
2. **Selection email:** session purpose, duration, incentive, recording choice,
   cancellation terms, and scheduling.
3. **Research consent:** separate choices for the interview, recording,
   internal document testing, de-identified derivative retention, and any
   quoted excerpt. Public release defaults to no.
4. **Redaction guide:** remove names, addresses, signatures, emails, phones,
   account and loan numbers, QR/bar codes, salesperson identifiers, and file
   metadata. Offer a synthetic packet instead.
5. **Secure file request:** one participant, one private request, one random
   study ID. Do not use email attachment, Google Form file upload, GitHub,
   Slack, or a public shared folder.
6. **Session and payment:** pay for the participant's time, not for surrendering
   a document. Document sharing remains optional.
7. **Deletion:** remove raw material within 90 days unless the participant made
   a separate longer-retention choice. Honor withdrawal where technically and
   legally possible.

Google Drive is not the default intake because anonymous uploads are not a
native Drive file-request workflow. Current official options include
[Dropbox File Requests](https://help.dropbox.com/share/create-file-request),
which accept uploads from people without Dropbox accounts and keep the
destination private by default, and
[Box File Request](https://support.box.com/hc/en-us/articles/360045304813-Using-File-Request-to-get-Content-from-Anyone),
which supports external uploaders, metadata, and enterprise controls on a Box
Business plan. Choose and security-review the workspace before asking the first
person for a document.

Minimum file-workspace requirements:

- named-user access with MFA;
- private destination folders and no broad shared links;
- per-participant request links or passwords;
- malware scanning and a documented download device;
- access and deletion logging;
- a written 90-day deletion calendar;
- no contract text in analytics, AI assistants, issue trackers, or chat tools;
- second-person redaction review before any excerpt becomes a test fixture.

## First 14 Days

### Already complete

- Published the no-document screener under the AIssisted Consulting Workspace.
- Verified required/optional fields manually after the generated draft failed
  to preserve them.
- Set responder access to anyone with the link, with no one-response sign-in
  requirement and no automatic verified-email collection.
- Disabled the duplicate-response link and enabled new-response email alerts.
- Sent the two consumer-organization inquiries listed above.

### Next without spending

1. Wait two business days, then follow up once with each organization if there
   is no response.
2. Request moderator permission from Solar Panel Talk and PVOutput.
3. Use only `/r/solar`'s current Community Promotion Post unless a moderator
   grants another placement.
4. Screen replies daily and schedule no more than four pilot sessions before
   reviewing the script and privacy questions.

### Requires a decision or budget

1. Approve a maximum of $900 for 12 participant incentives, paid at $75 each.
2. Approve up to $750 more only if a paid panel is needed for missing segments.
3. Select Dropbox File Request, Box File Request, or a reviewed custom upload
   service before requesting real documents.
4. Approve a city, mail vendor, print proof, address-list deletion date, and
   maximum postal budget before generating a household mailing file.

## Campaign Measures

Track by channel without analytics on the Solar Plainly app itself:

- invitations distributed;
- screener starts and complete responses;
- eligible and scheduled participants;
- attendance and no-show rate;
- financing/situation/language coverage;
- optional document-consent rate;
- privacy questions or complaints;
- participant withdrawal and deletion requests;
- cost per completed session;
- source-linked comprehension and workflow outcomes defined in the sourcing
  plan.

Pause a channel if any of these occurs:

- a moderator or organization asks the project to stop;
- a person reasonably believes the invitation came from their utility,
  installer, lender, or government;
- more than one percent of contacted households request no further mail;
- the campaign cannot explain where an address came from;
- a participant is asked for a document before separate consent;
- raw documents appear in email, Git, chat, analytics, or a broadly shared
  folder;
- the current deletion schedule cannot be met.

## Completion Criteria

The direct-consumer recruitment path is operational when:

- the screener and response alerts work;
- at least one partner or approved community channel is circulating it;
- the incentive and paid-recruiting ceiling are approved;
- the consent form, redaction guide, and session script are finalized;
- the secure upload workspace passes the minimum requirements;
- at least 12 moderated sessions cover the six priority situations;
- the first 30 consented packets meet the first half of the corpus quotas;
- every raw file has a study ID, consent record, access log, and deletion date;
- aggregate results can be published without exposing a participant or
  contract.
