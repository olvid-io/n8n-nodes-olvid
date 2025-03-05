![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-olvid

[![NPM Version](https://badge.fury.io/js/n8n-nodes-olvid.svg?style=flat)](https://npmjs.org/package/n8n-nodes-olvid)

This repo contains sources used to build Olvid n8n nodes.

## Setup

Please check to our documentation page to set up your installation:

https://doc.bot.olvid.io/n8n

## Warning

If this node does not work as expected or does not meet your requirements feel free to open an issue on this repository. 


# n8n-nodes-olvid

This is an n8n community node. It lets you use **Olvid** in your n8n workflows.

**Olvid** is a private instant message application available on every platform: https://olvid.io

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow our [installation guide](https://doc.bot.olvid.io/n8n) to set up an Olvid daemon and your n8n instance.

Or follow this [guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation to only install Olvid node (only if you know what you are doing).

## Operations

These nodes implement the entire Olvid daemon API. Here are a few examples of what you can do: receive notifications of incoming messages, respond to them or retrieve and send files.  

## Credentials

To use Olvid nodes you will need to create a client key or an admin client key on your Olvid daemon instance. Please refer to our [documentation](https://doc.bot.olvid.io). 

## Usage

You will find three nodes in this package.
- **Olvid** let you receive / send messages and attachments
- **Olvid Advanced** implements the entire daemon API, it's less easy to use, but you can do everything you want.
- **Olvid Admin** (needs an admin client key) let you manage your daemon identities and client keys.

## Resources

* [Olvid bot documentation](https://doc.bot.olvid.io)
* [Olvid website](https://olvid.io)
* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
