module.exports = {
    set: setSchema
};

var setSchema = {
    "title": "Votable",
    "type": "object",
    "properties": {
        "id": {
            "description": "The unique ID of the votable",
            "type": "string"
        },
        "type": {
            "description": "The type of votable",
            "enum": ["question", "statement"]
        },
        "activation_date": {
            "type": "string",
            "format": "date-time"
        },
        "end_date": {
            "type": "string",
            "format": "date-time"
        },
        "publication_date": {
            "type": "string",
            "format": "date-time"
        },
        "tags": {
            "type": "object",
            "required": ["language", "list"],
            "properties": {
                "language": { "type": "string" },
                "list": { "type": "array", "items": { "type": "string"} }
            }
        },
        "content": {
            "type": "object",
            "required": ["language", "text"],
            "properties": {
                "language": { "type": "string" },
                "text": { "type": "string" }
            }
        },
        "choices": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "label"],
                "properties": {
                    "id": { "type": "string" },
                    "label": {
                        "type": "object",
                        "required": ["language", "text"],
                        "properties": {
                            "language": { "type": "string" },
                            "text": { "type": "string" }
                        }
                    }
                }
            }
        }
    },
    "required": ["id", "type", "activation_date", "end_date", "publication_date"]
};