// jasonxu-2017/11/20
package wda

import (
	"encoding/json"
)

type PageJsonSource struct {
	Name      string `json:"name"`
	Type      string `json:"type"`
	Value     string `json:"value"`
	Label     string `json:"label"`
	IsEnabled bool   `json:"isEnabled"`
	IsVisible bool   `json:"isVisible"`
	Rect struct {
		X      float32 `json:"x"`
		Y      float32 `json:"y"`
		Width  float32 `json:"width"`
		Height float32 `json:"height"`
	} `json:"rect"`
	Children      []*PageJsonSource `json:"children"`
	Frame         string            `json:"frame"`
	RawIdentifier string            `json:"rawIdentifier"`
}

type Source struct {
	Value  *PageJsonSource `json:"value"`
	Status int             `json:"status"`
}

func (c *Client) GetJsonSource() (*Source, error) {
	resp, err := c.get("/source?format=json")
	if err != nil {
		return nil, err
	}
	var source *Source
	err = json.Unmarshal(resp, &source)
	if err != nil {
		return nil, err
	}
	return source, nil
}
