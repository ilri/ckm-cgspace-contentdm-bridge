# CGBridge

A tool to serve as a middleware between CGSpace (DSpace) and ContentDM, with the intent of facilitating importing of content from ContentDM to CGSpace.

## Workflow

The following is an overview of how the application works:

1. A user sign in to the system through a normal Username and Password form.
2. The user is provides some settings as to the end points of the ContentDM services are. 
3. Using sample item data return from the specified endpoint, the user will be asked to map the imported item keys to a pre-existing list keys adopted from CGSpace.
4. Based on the endpoints and the mapping; the system pulls data from the endpoint and saves it into database, through batch processing.
5. The system provides an [OAI-PMH](https://www.openarchives.org/pmh/) interface for CGSpace to harvest the content from it.


## More Information

Please visit the [wiki](https://github.com/ilri/ckm-cgspace-contentDM-bridge/wiki) for this repository to know more about the system.

# License

This project is licensed under the [GNU General Public License Version 3 (GPL v3)](license.md).
