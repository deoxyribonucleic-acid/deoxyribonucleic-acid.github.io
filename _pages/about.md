---
permalink: /
author_profile: false
redirect_from: 
  - /about/
  - /about.html
---

<section class="home-section" id="about" markdown="1">

<aside class="profile-card">
  <img class="profile-card__avatar" src="{{ site.author.avatar | prepend: '/images/' | relative_url }}" alt="{{ site.author.name }}">
  <div class="profile-card__name">{{ site.author.name }}</div>
  {%- if site.author.bio %}
  <div class="profile-card__bio">{{ site.author.bio }}</div>
  {%- endif %}
  <ul class="profile-card__icons">
    {%- if site.author.email %}
    <li><a href="mailto:{{ site.author.email }}" title="Email" aria-label="Email"><i class="fas fa-envelope" aria-hidden="true"></i></a></li>
    {%- endif %}
    {%- if site.author.googlescholar %}
    <li><a href="{{ site.author.googlescholar }}" title="Google Scholar" aria-label="Google Scholar"><i class="ai ai-google-scholar" aria-hidden="true"></i></a></li>
    {%- endif %}
    {%- if site.author.orcid %}
    <li><a href="{{ site.author.orcid }}" title="ORCID" aria-label="ORCID"><i class="ai ai-orcid" aria-hidden="true"></i></a></li>
    {%- endif %}
    {%- if site.author.github %}
    <li><a href="https://github.com/{{ site.author.github }}" title="GitHub" aria-label="GitHub"><i class="fab fa-github" aria-hidden="true"></i></a></li>
    {%- endif %}
    {%- if site.author.linkedin %}
    <li><a href="https://www.linkedin.com/in/{{ site.author.linkedin }}/" title="LinkedIn" aria-label="LinkedIn"><i class="fab fa-linkedin" aria-hidden="true"></i></a></li>
    {%- endif %}
  </ul>
</aside>

<div class="bio-text" markdown="1">

## Biography {#about-heading}

I am a first-year Ph.D. student in Electrical and Computer Engineering at [Purdue University](https://engineering.purdue.edu/ECE), advised by [Prof. Ziran Wang](https://ziranw.github.io/). Prior to joining Purdue, I received my M.S. in Electrical and Computer Engineering from the University of Michigan, Ann Arbor, and my B.E. in Digital Media Technology from Communication University of China.

My research interests lie at the intersection of **foundation models**, **autonomous vehicles**, and **intelligent traffic systems**.

</div>

</section>

<section class="home-section" id="news" markdown="1">

## 📰 News {#news-heading}

<ul class="news-list">
{%- comment -%} sort on "date|index" strings so quoted and unquoted YAML dates mix safely {%- endcomment -%}
{%- assign news_keys = "" | split: "" %}
{%- for item in site.data.news %}
  {%- assign news_key = item.date | append: "|" | append: forloop.index0 %}
  {%- assign news_keys = news_keys | push: news_key %}
{%- endfor %}
{%- assign news_keys = news_keys | sort | reverse %}
{%- for news_key in news_keys %}
  {%- assign news_idx = news_key | split: "|" | last | plus: 0 %}
  {%- assign item = site.data.news[news_idx] %}
  <li><strong>{% include month-year.html date=item.date %}</strong> &nbsp; {{ item.text | markdownify | remove: '<p>' | remove: '</p>' | strip }}</li>
{%- endfor %}
</ul>

</section>

{% comment %} Education is hidden. Remove this comment tag and its matching endcomment to show it again; the entries live in _data/education.yml. {% endcomment %}
{% comment %}
<section class="home-section" id="education" markdown="1">

## 📚 Education {#education-heading}

<div class="entry-list">
{%- for edu in site.data.education %}
  <div class="entry">
    <img class="entry-logo" src="{{ edu.logo | prepend: '/images/logos/' | relative_url }}" alt="{{ edu.school }} logo">
    <div class="entry-body">
      <div class="entry-title">{{ edu.degree }}</div>
      <div class="entry-sub"><a href="{{ edu.url }}">{{ edu.school }}</a>, {{ edu.location }}</div>
      <div class="entry-meta">{{ edu.period }}</div>
    </div>
  </div>
{%- endfor %}
</div>

</section>
{% endcomment %}

<section class="home-section" id="experience" markdown="1">

## 🔬 Experience {#experience-heading}

<div class="entry-list">
{%- for job in site.data.experience %}
  <div class="entry">
    {%- if job.logo %}
    <img class="entry-logo" src="{{ job.logo | prepend: '/images/logos/' | relative_url }}" alt="{{ job.org }} logo">
    {%- else %}
    <span class="entry-logo entry-logo--placeholder" aria-hidden="true"><i class="fas fa-building"></i></span>
    {%- endif %}
    <div class="entry-body">
      <div class="entry-title">{{ job.org }}</div>
      <div class="entry-sub">{{ job.role }}</div>
      {%- if job.mentor or job.faculty_advisor %}
      {%- if job.faculty_advisor %}
      <div class="entry-sub">Faculty Advisor: {% include person-link.html name=job.faculty_advisor url=job.faculty_advisor_url %}</div>
      {%- endif %}
      {%- if job.mentor %}
      <div class="entry-sub">Research Mentor: {% include person-link.html name=job.mentor url=job.mentor_url %}</div>
      {%- endif %}
      {%- elsif job.advisor %}
      <div class="entry-sub">Advisor: {% include person-link.html name=job.advisor url=job.advisor_url %}</div>
      {%- endif %}
      <div class="entry-meta">{{ job.location }} | {{ job.period }}</div>
    </div>
  </div>
{%- endfor %}
</div>

</section>

<section class="home-section" id="publications" markdown="1">

## 📝 Publications {#publications-heading}

<ul class="pub-list">
{%- for post in site.publications reversed %}
  <li class="pub-item{% if post.image %} pub-item--with-image{% endif %}">
    {%- if post.image %}
    <a class="pub-thumb" href="{{ post.paperurl | default: '#' }}">
      <img src="{{ post.image | prepend: '/images/publications/' | relative_url }}" alt="{{ post.title | escape }}" loading="lazy">
    </a>
    {%- endif %}
    <div class="pub-body">
      <span class="pub-title">{{ post.title }}</span><br>
      <span class="pub-authors">{{ post.authors }}</span><br>
      <span class="pub-venue"><em>{{ post.venue }}</em>, {{ post.date | date: "%Y" }}</span><br>
      {%- if post.paperurl %}
      <span class="pub-links"><a href="{{ post.paperurl }}">Paper</a></span>
      {%- endif %}
    </div>
  </li>
{%- endfor %}
</ul>

{%- assign equal_pubs = site.publications | where: "equal_contribution", true %}
{%- if equal_pubs.size > 0 %}
<p class="pub-footnote"><sup>*</sup>Equal contribution</p>
{%- endif %}

</section>
