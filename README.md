# GitHub Action for UCloud CDN certificate deployment

Deploy SSL certificate to UCloud CDN.

# Usage

> If you need to issue SSL certificates automatically, you can use [enroll acme.sh action](https://github.com/marketplace/actions/issue-ssl-certificate).

This action will deploy your PEM-formatted SSL certificate to CDN.

```yaml
jobs:
  deploy-to-ucloud-cdn:
    name: Deploy certificate to UCloud CDN
    runs-on: ubuntu-latest
    steps:
      - uses: tls-deploy-actions/ucloud-cdn@v1.01
        with:
          public-key: ${{ secrets.UCLOUD_PUBLIC_KEY }}
          private-key: ${{ secrets.UCLOUD_PRIVATE_KEY }}
          project-id: org-000xhs
          areacode: cn
          fullchain-file: /path-to/fullchain.pem
          key-file: /path-to/key.pem
          cdn-domains-id: |
            ucdn-3oe32hsbf
