# 📊 Competitive Intel — Weekly Report
**Week of {{ date }}**

---

## 🐙 GitHub Activity

{% for repo in github_findings %}
### `{{ repo.name }}`
- ⭐ Stars: **{{ repo.stars }}** ({{ repo.stars_delta }})
- 🍴 Forks: **{{ repo.forks }}** ({{ repo.forks_delta }})
{% if repo.new_releases %}
- 🚀 New releases: {{ repo.new_releases | join(", ") }}
{% endif %}
{% if repo.new_commits %}
- 📝 {{ repo.new_commits }} new commit(s) — latest: *"{{ repo.latest_commit_msg }}"*
{% endif %}
{% if repo.issues_delta != 0 %}
- 🐛 Issues delta: {{ repo.issues_delta }}
{% endif %}
{% endfor %}

---

## 📰 News & Blog Updates

{% for source in news_findings %}
### {{ source.url }}
{% for item in source.new_items %}
- [{{ item.title }}]({{ item.link }}) — {{ item.date }}
{% endfor %}
{% if not source.new_items %}
- *(no new posts)*
{% endif %}
{% endfor %}

---

*Next report: {{ next_report_date }} | Powered by Hermes Competitive Intel*
